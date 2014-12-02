import csv, json

films = []
actors = []

def generate_id(a_string):
	an_id = a_string.lower()
	an_id = an_id.replace(" ", "_")
	an_id = an_id.replace(".", "")
	an_id = an_id.replace("!", "")
	an_id = an_id.replace("?", "")
	an_id = an_id.replace(",", "")
	an_id = an_id.replace(":", "")
	return an_id

with open('freebase_performances.csv') as csvfile:
	reader = csv.DictReader(csvfile)
	for row in reader:
		films.append(row['film_name'])
		actors.append(row['actor_name'])

unique_films = set(films)
unique_actors = set(actors)

nodes = []

for film in unique_films:
	nodes.append({'name' : film, 'type': 'film', 'id': generate_id(film), 'actors' : 0})

for actor in actors:
	nodes.append({'name' : actor, 'type': 'actor', 'id': generate_id(actor)})

links = []

with open('freebase_performances.csv') as csvfile:
	reader = csv.DictReader(csvfile)
	for row in reader:
		source_id = generate_id(row['film_name'])
		target_id = generate_id(row['actor_name'])
		links.append({"source": source_id, "target": target_id})

more_than_one_actor = []
last_movie = ""
for link in links:
	if link["source"] in more_than_one_actor:
		pass
	elif link["source"] == last_movie:
		more_than_one_actor.append(link["source"])
	else:
		last_movie = link["source"]

for node in nodes:
	if not node["id"] in more_than_one_actor or not node["type"] == "actor":
		nodes.remove(node)
for link in links:
	if not links["source"] in more_than_one_actor :
		links.remove(link)

output = {"nodes":nodes,"links":links}

with open("parsed.json", "w") as outfile:
	json.dump(output, outfile, indent=4)
