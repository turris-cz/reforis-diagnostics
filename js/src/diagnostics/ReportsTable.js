import React, { useEffect, useContext } from "react";
import PropTypes from "prop-types";

import {
    useAPIGet,
    useAPIDelete,
    SpinnerElement,
    Button,
    AlertContext,
    DownloadButton,
} from "foris";

import API_URLs from "API";

const REPORT_REFRESH_INTERVAL = 500; // milliseconds

ReportsTable.propTypes = {
    reports: PropTypes.array.isRequired,
    onReload: PropTypes.func.isRequired,
};

export default function ReportsTable({ reports, onReload }) {
    if (reports.length === 0) {
        return <p className="text-muted text-center">{_("There are no reports available.")}</p>;
    }

    return (
        <table className="table table-hover" data-testid="reports-table">
            <tbody>
                <tr>
                    <th scope="col">{_("ID")}</th>
                    <th scope="col" aria-label={_("Download")} />
                    <th scope="col" aria-label={_("Delete")} />
                </tr>
                {reports.map(
                    (report) => <Report key={report.diag_id} report={report} onReload={onReload} />,
                )}
            </tbody>
        </table>
    );
}

Report.propTypes = {
    report: PropTypes.object.isRequired,
    onReload: PropTypes.func.isRequired,
};

function Report({ report, onReload }) {
    const setAlert = useContext(AlertContext);

    const [deleteReportResponse, deleteReport] = useAPIDelete(`${API_URLs.reports}/${report.diag_id}`);
    useEffect(() => {
        if (deleteReportResponse.isSuccess) {
            onReload();
        } else if (deleteReportResponse.isError) {
            setAlert(_("Cannot delete report"));
        }
    }, [deleteReportResponse, onReload, setAlert]);

    const [getReportResponse, getReport] = useAPIGet(`${API_URLs.reports}/${report.diag_id}`);
    // Initial check for "ready" status
    useEffect(() => {
        if (report.status !== "ready") {
            getReport();
        }
    }, [report, getReport]);
    // Repeatedly check status until it's "ready"
    useEffect(() => {
        if (!getReportResponse.isLoading && getReportResponse.data) {
            if (getReportResponse.data.status !== "ready") {
                const timeout = setTimeout(() => getReport(), REPORT_REFRESH_INTERVAL);
                return () => clearTimeout(timeout);
            }
            onReload();
        } else if (getReportResponse.isError) {
            setAlert(_("Cannot fetch report data"));
        }
    }, [getReportResponse, getReport, onReload, setAlert]);

    const isReady = report.status === "ready";

    return (
        <tr>
            <td className="align-middle">{report.diag_id}</td>
            <td className="text-center">
                {isReady
                    ? <DownloadButton href={`${API_URLs.reports}/${report.diag_id}/contents`}>{_("Download")}</DownloadButton>
                    : <SpinnerElement />}
            </td>
            <td className="text-right">{isReady && <Button className="btn-danger" onClick={deleteReport}>{_("Delete")}</Button>}</td>
        </tr>
    );
}
