import { AvatarCoin } from "@raioviajante/design/avatar-coin";
import { IndexHeader } from "@raioviajante/design/parts";
import type { LocaleId } from "../../../../site/locales";
import { copyFor } from "../lib/copy";

/** The index header with the animated avatar, as on root and dump. */
export function DocsIndexHeader({ line, locale }: { line: string; locale: LocaleId }) {
	const labels = copyFor(locale);
	return (
		<IndexHeader
			name="docs"
			line={line}
			avatar={<AvatarCoin label={labels.avatar} reducedMotionLabel={labels.reducedAvatar} />}
		/>
	);
}
