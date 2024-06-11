import os
import re
import pandas as pd
import json
import glob


def collapse(folders):
    all_data = []
    file_pattern = re.compile(r'^\d+\.json$')
    for folder in folders:
        for filename in os.listdir(folder):
            if file_pattern.match(filename):
                file_path = os.path.join(folder, filename)
                with open(file_path, 'r') as file:
                    data = json.load(file)
                    data['course'] = folder
                    all_data.append(data)

    df = pd.DataFrame(all_data)
    return df


# Example usage
folders = glob.glob('*-kb-*')
df = collapse(folders)
df.to_parquet("data/discourse.parquet", index=False)
