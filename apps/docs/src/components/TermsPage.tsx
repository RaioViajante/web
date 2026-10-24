import { LegalPage } from "@raioviajante/design/templates";

export function TermsPage() {
	return (
<LegalPage
		site="docs"
		title="Terms of Use"
		inShort={[
			{ label: "reading", value: "free" },
			{ label: "accounts", value: "none" },
			{ label: "warranty", value: "none — things may break" },
		]}
		sections={[
			{
				title: "Who runs this",
				body: (
					<p>
						docs.raioviajante.com is run by RaioViajante, CNPJ 53.021.377/0001-93, as part of raioviajante.com. Questions go to{" "}
						<a href="mailto:mail@raioviajante.com">mail@raioviajante.com</a>.
					</p>
				),
			},
			{
				title: "What the documentation is",
				body: (
					<p>
						These pages describe projects and systems built under RaioViajante, as they work today. A page can be out of date;
						the source repository of each project is the authority.
					</p>
				),
			},
			{
				title: "Code",
				body: <p>Code shown here follows the license of the repository it comes from.</p>,
			},
		]}
	/>
	);
}
