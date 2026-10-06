import { NotFoundPage } from "@raioviajante/design/templates";
import { SearchNavItem } from "@raioviajante/design/search";
export function LabNotFound() {
  return (
    <NotFoundPage
      site="lab"
      line="this page moved, never existed, or the experiment broke. things may break."
      tryInstead={[
        { label: "all experiments", value: "index", href: "/" },
        {
          label: "001 filename classifier",
          value: "runs here",
          href: "/experiments/filename-classifier/",
        },
        {
          label: "002 execution states",
          value: "simulated",
          href: "/experiments/execution-states/",
        },
        {
          label: "raioviajante.com",
          value: "start over",
          href: "https://raioviajante.com",
        },
      ]}
      ask={<SearchNavItem number="" label="ask RaioViajante" href="/search/" />}
    />
  );
}
