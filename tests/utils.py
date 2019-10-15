from reforis.test_utils import get_mocked_client

def get_mocked_diagnostics_client(*args, **kwargs):
    return get_mocked_client('reforis_diagnostics', *args, *kwargs)
