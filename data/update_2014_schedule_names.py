import csv

teams_file = r"e:\Repositories\DynastyFFL\data\Dynasty League Data - Teams.csv"
schedule_file = r"e:\Repositories\DynastyFFL\data\Dynasty League Data - Schedule.csv"
output_file = r"e:\Repositories\DynastyFFL\data\Dynasty League Data - Schedule.updated.csv"

# 1. Build a mapping: for each team number, a sorted list of (year, name)
team_name_history = {}
with open(teams_file, newline='', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        team_num = row['Team']
        year = int(row['Year'])
        name = row['Name'].strip()
        if team_num not in team_name_history:
            team_name_history[team_num] = []
        team_name_history[team_num].append((year, name))

# For each team, sort the name history by year
for team_num in team_name_history:
    team_name_history[team_num].sort()

# Build a mapping of all known names (any year) to team number
name_to_teamnum = {}
for team_num, history in team_name_history.items():
    for _, name in history:
        name_to_teamnum[name] = team_num

def get_name_for_year(team_num, year):
    """Return the team name for this team_num as of the given year."""
    if team_num not in team_name_history:
        return None
    name = None
    for y, n in team_name_history[team_num]:
        if y <= year:
            name = n
        else:
            break
    return name

# 2. Update the schedule file for all years
with open(schedule_file, newline='', encoding='utf-8') as f, \
     open(output_file, 'w', newline='', encoding='utf-8') as out:
    reader = csv.reader(f)
    writer = csv.writer(out)
    header = next(reader)
    writer.writerow(header)
    for row in reader:
        if not row or row[0].startswith('//'):
            writer.writerow(row)
            continue
        try:
            year = int(row[0])
        except Exception:
            writer.writerow(row)
            continue
        # Update Home Team and Away Team if they match a known name
        for idx in [3, 4]:
            team_name = row[idx].strip() if len(row) > idx and row[idx] else ''
            if team_name in name_to_teamnum:
                team_num = name_to_teamnum[team_name]
                correct_name = get_name_for_year(team_num, year)
                if correct_name:
                    row[idx] = correct_name
        writer.writerow(row)

print("Done. Output written to", output_file)