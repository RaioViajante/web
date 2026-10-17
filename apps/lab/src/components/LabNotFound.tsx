import { NotFoundPage } from "@raioviajante/design/templates";
import { DEFAULT_LOCALE } from "../../../../site/locales";
import { SearchNavItem } from "@raioviajante/design/search";
export function LabNotFound() {
  return (
    <NotFoundPage
      site="lab"
      locale={DEFAULT_LOCALE}
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
      ask={
        <SearchNavItem
          number=""
          label="ask RaioViajante"
          site="lab"
          locale={DEFAULT_LOCALE}
        />
      }
    />
  );
}
