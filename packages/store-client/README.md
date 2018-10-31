# Chainscript Store Client

A store is a database abstraction specifically designed for working with
Chainscript.

Stratumn provides multiple store implementations and anyone can build a
new store that meets their performance/scalability requirements.

Some store implementations can be found [here](https://github.com/stratumn/go-core).

## Usage: HTTP client

### Create and find segments

The unit of data in Chainscript is a link. A link is immutable (making it a
good fit for blockchains) and describes a simple step that takes place in a
shared process.

Once a link is stored it can be addressed by its link hash. Authenticity of the
link can be verified by re-hashing it and checking that the hash matches.

A link is then wrapped inside a segment that allows enriching it with mutable
data such as proofs of existence (evidences).

```javascript
import { LinkBuilder } from "@stratumn/js-chainscript";
import {
  Pagination,
  SegmentsFilter,
  StoreHttpClient
} from "@stratumn/store-client";

// This is a new link that your application wants to store.
// In this case it initializes a process for tracking the 2018 election.
const link = new LinkBuilder("voting protocol", "2018 election")
  .withStep("init")
  .build();

// This is the url where the store you want to use is hosted.
const storeEndpoint = "https://store.your-domain.com";

const client = new StoreHttpClient(storeEndpoint);
await client.createLink(link);

// The link can be addressed by its hash.
// The link is wrapped in a segment that enriches it with mutable metadata.
const segment = await client.getSegment(link.hash());

// Or you can search for segments using filtering options.
const filters = new SegmentsFilter("voting protocol")
  .withStep("init")
  .withoutParent();
// And provide pagination options (skip 5 elements and return 10 elements).
const pageOptions = new Pagination(5, 10);
const segments = await client.findSegments(filters, pageOptions);
```

### List maps

A process can have multiple instances, that we call `maps`. A map is identified
by its map ID.

You can easily list all the maps of a given process to then drill into a
specific instance.

```javascript
import { LinkBuilder } from "@stratumn/js-chainscript";
import { StoreHttpClient } from "@stratumn/store-client";

const vote1 = new LinkBuilder("vote_tracker", "2018_Q1").build();
const vote2 = new LinkBuilder("vote_tracker", "2018_Q2").build();
const other = new LinkBuilder("home_automation", "fridge").build();

const client = new StoreHttpClient("https://store.stratumn.com");
await client.createLink(vote1);
await client.createLink(vote2);
await client.createLink(other);

// Will contain ["2018_Q1", "2018_Q2"]
const mapIDs = await client.getMapIDs("vote_tracker");
```

### Adding evidence

Once a link has been stored, it is recommended to produce some external
evidence of its existence.

A fossilizer can be used to achieve that and then store the new evidence in the
Chainscript store.

```javascript
import { Evidence, LinkBuilder } from "@stratumn/js-chainscript";
import {
  FossilizedEvent,
  FossilizerHttpClient
} from "@stratumn/fossilizer-client";
import { StoreHttpClient } from "@stratumn/store-client";

const store = new StoreHttpClient("https://store.stratumn.com");
const link = new LinkBuilder("car_insurance", "user42").build();
await store.createLink(link);

const fossilizer = new FossilizerHttpClient(
  "https://fossilize.stratumn.com",
  async (e: FossilizedEvent) => {
    // Store each new evidence.
    // We know that in our application e.data will always be a link hash.
    await store.addEvidence(e.data, e.evidence);
  }
);

// Fossilizing the link will provide an asynchronous evidence.
await fossilizer.fossilize(
  Buffer.from(link.hash()).toString("hex"),
  "user42's car insurance audit trail"
);
```

### Subscribe to notifications

Chainscript stores send notifications about important events to connected
clients.

It's likely that your application will have multiple clients producing links
connected to the same store. Subscribing to notifications lets you know when
other participants create links or add evidence.

```javascript
import {
  SAVED_EVIDENCES_EVENT,
  SAVED_LINKS_EVENT,
  StoreEvent,
  StoreHttpClient
} from "@stratumn/store-client";

const store = new StoreHttpClient(
  "https://store.stratumn.com",
  (e: StoreEvent) => {
    if (e.type === SAVED_LINKS_EVENT) {
      const newLinks = e.links;
      // Do something with the links (display a notification or update UI).
    }

    if (e.type === SAVED_EVIDENCES_EVENT) {
      e.evidences.map(ev => {
        if (ev.linkHash === "some important link we're watching") {
          // Trigger something appropriate.
        }
      });
    }
  }
);
```

### Provide a custom logger

The http client accepts an optional logger argument.
If you are interested in logging the events raised by this package, here is how
you can do it:

```javascript
import { StoreEvent, StoreHttpClient } from "@stratumn/store-client";

// Custom client that sends logging events to the console.
const client = new StoreHttpClient(
  "http://localhost:5000/",
  (e: StoreEvent) => {
    console.info(e);
  },
  {
    info(event: any) {
      console.info(event);
    },
    warn(event: any) {
      console.warn(event);
    },
    error(event: any) {
      console.error(event);
    }
  }
);
```
