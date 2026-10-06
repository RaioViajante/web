import { AvatarCoin } from "@raioviajante/design/avatar-coin";
import { IndexHeader } from "@raioviajante/design/parts";

/** The index header with the animated avatar, as on root and dump. */
export function DocsIndexHeader() {
	return (
		<IndexHeader
			name="docs"
			line="technical documentation for things built under raioviajante."
			avatar={<AvatarCoin />}
		/>
	);
}
