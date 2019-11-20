/*
 * Copyright (C) 2019 CZ.NIC z.s.p.o. (http://www.nic.cz/)
 *
 * This is free software, licensed under the GNU General Public License v3.
 * See /LICENSE for more information.
 */

import React from "react";
import PropTypes from "prop-types";

import { Button, DownloadButton, SpinnerElement } from "foris";

import API_URLs from "API";
import { useDeleteReport, useReportIsReady } from "./hooks";

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
                {reports.map((report) => (
                    <ReportRow
                        key={report.diag_id}
                        report={report}
                        onReload={onReload}
                    />
                ))}
            </tbody>
        </table>
    );
}

ReportRow.propTypes = {
    report: PropTypes.object.isRequired,
    onReload: PropTypes.func.isRequired,
};

function ReportRow({ report, onReload }) {
    const isReady = useReportIsReady(report);
    const deleteReport = useDeleteReport(report.diag_id, onReload);

    return (
        <tr>
            <td className="align-middle">
                {report.diag_id}
            </td>

            <td className="text-center">
                {isReady ? (
                    <DownloadButton
                        href={`${API_URLs.reports}/${report.diag_id}/contents`}
                    >
                        {_("Download")}
                    </DownloadButton>
                ) : <SpinnerElement />}
            </td>

            <td className="text-right">
                {isReady && (
                    <Button
                        className="btn-danger"
                        onClick={deleteReport}
                    >
                        {_("Delete")}
                    </Button>
                )}
            </td>
        </tr>
    );
}