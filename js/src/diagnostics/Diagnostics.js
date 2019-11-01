import React, { useEffect } from "react";

import { Spinner, useAPIGet } from "foris";

import API_URLs from "API";
import Modules from "./Modules";
import ReportsTable from "./ReportsTable";

export default function Diagnostics() {
    const [getReportsResponse, getReports] = useAPIGet(API_URLs.reports);
    useEffect(() => {
        getReports();
    }, [getReports]);

    let reportsComponent;
    if (!getReportsResponse.isLoading && !getReportsResponse.isError && getReportsResponse.data) {
        reportsComponent = <ReportsTable reports={getReportsResponse.data} onReload={getReports} />;
    } else if (getReportsResponse.isError) {
        reportsComponent = <p className="text-center text-danger">{_("An error occurred during loading reports")}</p>;
    } else {
        reportsComponent = <Spinner className="my-3 text-center" />;
    }

    return (
        <>
            <h1>{_("Diagnostics")}</h1>
            <p>{_("Generate a diagnostics report to simplify debugging some problems related to the router's functionality.")}</p>
            <Modules onReload={getReports} />
            <h3 className="mt-3">{_("Reports")}</h3>
            {reportsComponent}
        </>
    );
}
