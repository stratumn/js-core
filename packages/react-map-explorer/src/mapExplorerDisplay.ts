/*
  Copyright 2018 Stratumn SAS. All rights reserved.

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

import { Segment } from '@stratumn/js-chainscript';
import {
  HierarchyPointLink,
  HierarchyPointNode,
  stratify,
  tree
} from 'd3-hierarchy';
import { select } from 'd3-selection';
import { hashToString } from './hash';

const nodeSize = 150;

/**
 * Map properties that are used to properly display segments.
 */
interface IMapProps {
  process: string;
  mapId: string;
  onSegmentSelected?: (s: Segment) => void;
}

interface ISegmentData {
  external: boolean;
  linkHash: string;
  parentHash: string;
  refs: string[]; // internal references (same map)
  step: string;
}

/**
 * Transform a segment array to a hierarchical structure suitable for D3
 * tree rendering.
 * @param segments contained in the map.
 * @param process of the displayed map.
 * @param mapId id of the displayed map.
 */
export const prepareSegments = (
  segments: Segment[],
  process: string,
  mapId: string
): HierarchyPointNode<ISegmentData> => {
  const data: ISegmentData[] = [];
  for (const s of segments) {
    // If the link is an external reference, we will add it when we add the
    // segment that references it.
    if (s.link().process().name !== process || s.link().mapId() !== mapId) {
      continue;
    }

    // Prepare the segment to display.
    const sData: ISegmentData = {
      external: false,
      linkHash: hashToString(s.linkHash()),
      parentHash: s.link().prevLinkHash()
        ? hashToString(s.link().prevLinkHash())
        : '',
      refs: [],
      step: s.link().step()
    };

    // Add the references.
    for (const r of s.link().refs()) {
      const rid = hashToString(r.linkHash);
      const rs = findSegment(rid, segments);
      if (rs.link().process().name === process && rs.link().mapId() === mapId) {
        // If the referenced link is inside the map, it will be displayed as a
        // normal map segment. We'll add an additional connection to it in a
        // second display pass.
        // Otherwise we'd need to handle multiple parents which d3-hierarchy
        // doesn't do.
        sData.refs.push(rid);
      } else {
        // Otherwise we display the external reference as a child of the
        // current segment.
        data.push({
          external: true,
          linkHash: rid,
          parentHash: sData.linkHash,
          refs: [],
          step: rs.link().step()
        });
      }
    }

    data.push(sData);
  }

  const root = stratify<ISegmentData>()
    .id(d => d.linkHash)
    .parentId(d => d.parentHash)(data);

  const treeLayout = tree<ISegmentData>();
  treeLayout.nodeSize([nodeSize, nodeSize]);
  const displayTree = treeLayout(root);

  return displayTree;
};

/**
 * Shorten the id to make it suitable for display.
 * @param id potentially long id.
 */
const shortId = (id: string): string => {
  return `${id.substring(0, 6)}...`;
};

/**
 * Find a segment by its hex-encoded hash.
 * This function assumes that the segment will be found.
 * @param id of the segment.
 * @param segments array to search.
 */
const findSegment = (id: string, segments: Segment[]): Segment => {
  const found = segments.find(
    (s: Segment) => id === hashToString(s.linkHash())
  );
  return found as Segment;
};

/**
 * Remove all children from the given node.
 * Use this to reset the element before displaying a new map.
 * @param node to reset.
 */
const reset = (node: SVGSVGElement) => {
  select(node)
    .selectAll('g')
    .remove();
};

/**
 * Use D3 to build the map and display it properly.
 */
export const displayMap = (
  node: SVGSVGElement,
  segments: Segment[],
  props: IMapProps
) => {
  reset(node);

  const displayTree = prepareSegments(segments, props.process, props.mapId);

  // Create containers for nodes and links.
  const innerG = select(node)
    .append('g')
    .attr('transform', 'translate(50,250)');

  innerG.append('g').classed('nodes', true);
  innerG.append('g').classed('links', true);

  const segmentSize = 100;

  // Display segment nodes.
  select(node)
    .select('g.nodes')
    .selectAll('rect.node')
    .data(displayTree.descendants())
    .enter()
    .append('rect')
    .classed('node', true)
    .attr('x', d => d.y)
    .attr('y', d => d.x)
    .attr('width', segmentSize)
    .attr('height', segmentSize)
    .style('fill', d => (d.data.external ? 'red' : 'steelblue'))
    .on('click', d => {
      if (props.onSegmentSelected) {
        const selected = findSegment(d.id as string, segments);
        props.onSegmentSelected(selected);
      }
    });

  // Display the link hash on each segment node.
  select(node)
    .select('g.nodes')
    .selectAll('text.node')
    .data(displayTree.descendants())
    .enter()
    .append('text')
    .attr('x', d => d.y + 10)
    .attr('y', d => d.x + segmentSize / 2)
    .text(d => shortId(d.id as string))
    .on('click', d => {
      if (props.onSegmentSelected) {
        const selected = findSegment(d.id as string, segments);
        props.onSegmentSelected(selected);
      }
    });

  // Display connections between segment nodes.
  select(node)
    .select('g.links')
    .selectAll('line.links')
    .data(displayTree.links())
    .enter()
    .append('line')
    .classed('link', true)
    .attr('x1', d => d.source.y + segmentSize)
    .attr('y1', d => d.source.x + segmentSize / 2)
    .attr('x2', d => d.target.y)
    .attr('y2', d => d.target.x + segmentSize / 2)
    .style('stroke', '#ccc')
    .style('stroke-width', '1px');

  // Display connections to in-map references (tricky edge case that we handle
  // separately).
  // To handle this case properly we would need to migrate from d3-hierarchy to
  // a DAG display.
  const internalRefs: Array<HierarchyPointLink<ISegmentData>> = [];
  for (const s of displayTree.descendants()) {
    if (!s.data.refs) {
      continue;
    }

    for (const r of s.data.refs) {
      const rp = displayTree.descendants().find(d => d.id === r);
      if (rp) {
        internalRefs.push({
          source: s,
          target: rp
        });
      }
    }
  }

  select(node)
    .select('g.links')
    .selectAll('line.links')
    .data(internalRefs)
    .enter()
    .append('line')
    .classed('link', true)
    .attr('x1', d => d.source.y + segmentSize / 2)
    .attr('y1', d => d.source.x + segmentSize / 2)
    .attr('x2', d => d.target.y + segmentSize / 2)
    .attr('y2', d => d.target.x + segmentSize / 2)
    .style('stroke', '#ccc')
    .style('stroke-width', '1px')
    .style('stroke-dasharray', '2');
};
