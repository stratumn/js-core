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

import { LinkReference, Segment } from '@stratumn/js-chainscript';
import { HierarchyPointNode, stratify, tree } from 'd3-hierarchy';
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
  isRef: boolean;
  linkHash: string;
  parentHash: string;
  step: string;
}

/**
 * Transform a segment array to a hierarchical structure suitable for D3
 * tree rendering.
 * Note: if a segment references another segment in the same map, we don't
 * have a tree structure anymore (because that referenced segment will have
 * two parents). This case isn't handled right now and the universe will
 * collapse if your map has such a layout.
 * We should update from d3-hierarchy to d3-dag to handle such cases (when
 * the d3-dag library is ready) or use dagre-d3.
 * We should also load the map iteratively to provide a more responsive user
 * experience.
 * @param segments contained in the map.
 */
export const prepareSegments = (
  segments: Segment[]
): HierarchyPointNode<ISegmentData> => {
  // We need a first pass to detect all references and connect them to the
  // segment that references them.
  const refs: ISegmentData[] = [];
  for (const s of segments) {
    const currentRefs = s
      .link()
      .refs()
      .map((r: LinkReference) => ({
        isRef: true,
        linkHash: hashToString(r.linkHash),
        parentHash: hashToString(s.linkHash()),
        step: ''
      }));
    refs.push(...currentRefs);
  }

  // Then we convert segments to segment data and make sure references point to
  // the segment that references them (and not their own parent segment).
  const data = segments.map((s: Segment) => {
    const asRef = refs.find(
      (r: ISegmentData) => r.linkHash === hashToString(s.linkHash())
    );

    // If the segment is referenced, we display it as an external ref.
    if (asRef) {
      return asRef;
    }

    // Otherwise it's a normal segment.
    return {
      isRef: false,
      linkHash: hashToString(s.linkHash()),
      parentHash: s.link().prevLinkHash()
        ? hashToString(s.link().prevLinkHash())
        : '',
      step: s.link().step()
    };
  });

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

  const displayTree = prepareSegments(segments);

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
    .style('fill', d => (d.data.isRef ? 'red' : 'steelblue'))
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
};
