// Re-export the Convex-generated API from a single stable app path.
// Uses a relative import to avoid Metro's package-exports guard on `convex/_generated/*`.

import { api, internal } from "../../../convex/_generated/api";

export { api, internal };
