from gramex.config import variables, app_log
import json
from gramex import cache
import pandas as pd
from gramex.http import CREATED


def pick(handler):
    df = cache.open(variables['DATA_PATH']).reset_index()
    xdf = df[df['r_body'].map(len) == 0]
    xdf = xdf[xdf['r_title'].map(len) == 0]
    sample = xdf.sample().iloc[0].to_dict()
    return {'sample': sample, 'count': len(df) - len(xdf)}


def redact(handler):
    sample_id = int(handler.path_args[0])
    selections = pd.DataFrame.from_records(json.loads(handler.request.body))
    df = cache.open(variables['DATA_PATH'])  # .set_index('id', verify_integrity=True)
    if selections.empty:
        df.loc[sample_id, 'r_body'] = [None]
        df.loc[sample_id, 'r_title'] = [None]
    else:
        body = selections[selections['elem'] == 'body']
        if body.empty:
            df.loc[sample_id, 'r_body'] = [None]
        else:
            df.loc[sample_id, 'r_body'] = body[['start', 'stop']].values.ravel().tolist()
        title = selections[selections['elem'] == 'title']
        if title.empty:
            df.loc[sample_id, 'r_title'] = [None]
        else:
            df.loc[sample_id, 'r_title'] = title[['start', 'stop']].values.ravel().tolist()
    for ix, rowdata in selections.iterrows():
        sent = df.loc[sample_id, rowdata['elem']]
        app_log.debug(sent[rowdata['start']:rowdata['stop']])
    # df.to_parquet(variables['DATA_PATH'])
    handler.set_status(CREATED)
    return
