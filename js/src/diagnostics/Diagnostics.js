import React, { useEffect } from "react";

import { useAPIGet, withSpinnerOnSending, withErrorMessage } from "foris";

import API_URLs from "API";
import Modules from "./Modules";
import ReportsTable from "./ReportsTable";

export default function Diagnostics() {
    const [getReportsResponse, getReports] = useAPIGet(API_URLs.reports);
    useEffect(() => {
        getReports();
    }, [getReports]);

    return (
        <>
            <h1>{_("Diagnostics")}</h1>
            <p>{_("Generate a diagnostics report to simplify debugging some problems related to the router's functionality.")}</p>
            <Modules onReload={getReports} />
            <h3 className="mt-3">{_("Reports")}</h3>
            <ReportsTableWithErrorAndSpinner
                apiState={getReportsResponse.state}
                reports={getReportsResponse.data}
                onReload={getReports}
            />
        </>
    );
}

const ReportsTableWithErrorAndSpinner = withSpinnerOnSending(withErrorMessage(ReportsTable));
