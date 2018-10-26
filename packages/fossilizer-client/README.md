# Chainscript Fossilizer Client

A fossilizer takes some data and provides an externally-verifiable proof of
existence for that data.
It also provides a relative ordering of the events that produced fossilized
data.

Stratumn provides multiple fossilizer implementations and anyone can build a
new fossilizer that meets their trust/scalability requirements.

Some fossilizer implementations can be found [here](https://github.com/stratumn/go-core).

For example, if you use a Bitcoin fossilizer, a merkle tree will be built from
a batch of data and will be included in a Bitcoin transaction.
Since the Bitcoin blockchain is immutable, you'll have a record that your data
existed at block N.
Since Bitcoin provides block ordering, you will also be able to prove that some
data was produced before or after some other data.

Another possibility is to use a trusted authority to act as a fossilizer.
It could be a bank, a government or a regulatory body.
It would sign your data with the timestamp at which it received it and send
back that signature.
If you trust that entity, you can trust its timestamp so it provides a
relative ordering for your events.

## Usage: HTTP client

### Fossilize complex data

```javascript
import { FossilizerHttpClient } from "@stratumn/fossilizer-client";
import { sha256 } from "js-sha256";

// This is the url where you host your fossilizer.
const fossilizerEndpoint = "https://fossilize.your-domain.com";

const client = new FossilizerHttpClient(fossilizerEndpoint);
const myComplexData = {
  user: {
    name: "batman",
    city: "paris"
  },
  action: {
    description: "fought crime",
    year: 2018
  }
};

// You should always fossilize a hash of your data or a commitment, not the
// data directly.
// This way the fossilizer service doesn't know what data you are fossilizing.
// And it's also cheaper to store small hashes/commitments in a blockchain.
await client.fossilize(
  sha256(JSON.stringify(myComplexData)),
  "batman's hall of fame"
);
```

### Subscribe to notifications

Fossilization is done asynchronously.
For blockchain fossilizers, it's a lot cheaper to batch multiple fossils in a
single blockchain transaction (usually the merkle root of the batch).

If you want to be notified when your data has been successfully fossilized, you
should provide an event handler to the constructor:

```javascript
import {
  FossilizedEvent,
  FossilizerHttpClient
} from "@stratumn/fossilizer-client";

// This is the url where you host your fossilizer.
const fossilizerEndpoint = "https://fossilize.your-domain.com";

const client = new FossilizerHttpClient(
  fossilizerEndpoint,
  (e: FossilizedEvent) => {
    if (e.meta === "batman is down") {
      callRobin(e.evidence);
    }
  }
);

await client.fossilize(
  "d7a8fbb307d7809469ca9abcb0082e4f8d5651e46d3cdb762d02d0bf37c9e592",
  "batman is down"
);
```
