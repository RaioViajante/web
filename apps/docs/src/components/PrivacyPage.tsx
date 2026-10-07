import { LegalPage } from "@raioviajante/design/templates";

export function PrivacyPage() {
	return (
<LegalPage
		site="docs"
		title="Privacy Policy"
		inShort={[
			{ label: "accounts", value: "none" },
			{ label: "comments", value: "none" },
			{ label: "sound preference", value: "saved in a cookie" },
		]}
		sections={[
			{
				title: "In your browser",
				body: (
					<>
					<p>
						Your sound preference is saved in a small cookie on .raioviajante.com, so every raioviajante site remembers it. The cookie is created only when you switch sound on or off, holds just that choice, and lasts one year. It is
						not used for tracking.
					</p>
					<p>
						Older versions of this site had a theme switcher that stored a choice in your browser as starlight-theme. Nothing reads or
						writes it now, so a leftover value is inert and can be cleared.
					</p>
					</>
				),
			},
			{
				title: "On the way to the page",
				body: (
					<p>
						Like any website, the host (Vercel) receives standard request data — IP address, browser and the page asked for — to
						deliver it.
					</p>
				),
			},
			{
				title: "Search",
				body: (
					<p>
						Search runs in your browser over a static index. The “everywhere” scope also reads the search indexes of the other
						RaioViajante sites; nothing you type is sent anywhere.
					</p>
				),
			},
		]}
	/>
	);
}
