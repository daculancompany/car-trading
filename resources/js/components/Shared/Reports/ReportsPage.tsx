import { Grid, GridItem } from "@chakra-ui/react";
import { useSearchParams } from "react-router-dom";
import type { ReportPath } from "../../../api/Reports/reportApi";
import ReportMenu from "./ReportMenu";
import ReportViewer from "./ReportViewer";
import { REPORTS } from "./reportDefinitions";

export default function ReportsPage() {
    const [searchParams, setSearchParams] = useSearchParams();

    const report = REPORTS.find((item) => item.key === searchParams.get("report")) ?? REPORTS[0];

    const handleSelect = (key: ReportPath) => {
        setSearchParams({ report: key }, { replace: true });
    };

    return (
        <Grid mt={4} gap={4} templateColumns={{ base: "1fr", lg: "230px minmax(0, 1fr)" }} alignItems="start">
            <GridItem minW={0}>
                <ReportMenu active={report.key} onSelect={handleSelect} />
            </GridItem>

            <GridItem minW={0}>
                <ReportViewer key={report.key} report={report} />
            </GridItem>
        </Grid>
    );
}
