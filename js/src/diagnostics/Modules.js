import React, { useEffect } from "react";
import PropTypes from "prop-types";

import {
    API_STATE, useAPIGet, useForm, withErrorMessage, withSpinner,
} from "foris";

import API_URLs from "API";
import ModulesForm from "./ModulesForm";

Modules.propTypes = {
    onReload: PropTypes.func.isRequired,
};

export default function Modules({ onReload }) {
    const [getModulesResponse, getModules] = useAPIGet(API_URLs.modules);
    useEffect(() => {
        getModules();
    }, [getModules]);

    const [formState, setFormValue] = useForm(bypassValidator);
    const formData = formState.data || {};
    useEffect(() => {
        if (getModulesResponse.state === API_STATE.SUCCESS) {
            const modules = getModulesResponse.data.modules.reduce(
                (modulesAccumulator, module) => ({
                    ...modulesAccumulator,
                    [module.module_id]: false,
                }),
                {},
            );
            setFormValue((value) => ({ $set: { modules: value } }))({ target: { value: modules } });
        }
    }, [getModulesResponse, setFormValue]);
    const descriptions = getModulesResponse.data && getModulesResponse.data.modules.reduce(
        (descriptionsAccumulator, module) => (
            {
                ...descriptionsAccumulator,
                [module.module_id]: module.description,
            }
        ),
        {},
    );
    return (
        <>
            <h3>{_("Modules")}</h3>
            <ModulesFormWithErrorAndSpinner
                apiState={getModulesResponse.state}
                onReload={onReload}
                modules={formData.modules}
                descriptions={descriptions}
                setFormValue={setFormValue}
            />
        </>
    );
}

// Has to be defined outside component as it would cause re-renders
function bypassValidator() {
    return {};
}

const withSpinnerOnModules = withSpinner((props) => !props.modules);
const ModulesFormWithErrorAndSpinner = withErrorMessage(withSpinnerOnModules(ModulesForm));
