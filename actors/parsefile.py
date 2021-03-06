import csv, json

films = []
actors = []

actors_array = ["Will Ferrell", "Zach Galifianakis", "John C. Reilly", "Vince Vaughn", "Paul Rudd", "Jason Segel", "Danny McBride", "Mila Kunis", "Megan Fox", "Leslie Mann", "Jackie Chan","Jonah Hill", "Seth Rogen", "Russell Brand", "Bruce Lee", "Clint Eastwood", "Daniel Radcliffe", "Emma Watson", "Morgan Freeman"]

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
		if row['actor_name'] in actors_array:
			films.append(row['film_name'])
			actors.append(row['actor_name'])
		
unique_films = set(films)
unique_actors = set(actors)

nodes = []

for film in unique_films:
	nodes.append({'name' : film, 'type': 'film', 'id': generate_id(film)})

for actor in unique_actors:
	nodes.append({'name' : actor, 'type': 'actor', 'id': generate_id(actor)})

links = []

with open('freebase_performances.csv') as csvfile:
	reader = csv.DictReader(csvfile)
	for row in reader:
		if row['actor_name'] in actors_array:
			source_id = generate_id(row['film_name'])
			target_id = generate_id(row['actor_name'])
			links.append({"source": source_id, "target": target_id})


output = {"nodes":nodes,"links":links}

with open("parsed.json", "w") as outfile:
	json.dump(output, outfile, indent=4)
