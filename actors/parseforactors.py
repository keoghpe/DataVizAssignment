import csv, json

films = []
actors = []

actors_list = ["Will Ferrell", "Steve Carell","Vince Vaughn","David Koechner","Ben Stiller", "Owen Wilson", "Seth Rogen", "Bruce Lee", "Megan Fox", "Paul Rudd", "Leslie Mann", "Chris O'Dowd", "Jason Segel", "Jackie Chan", "Jet Li", "Shia LaBeouf","Leonardo DiCaprio", "Jonah Hill", "Matthew McConaughey", "Brad Pitt", "Christoph Waltz"]

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
		if row['actor_name'] in actors_list: #and row['film_name'] in films_list:	
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
		if row['actor_name'] in actors_list: #and row['film_name'] in films_list:		
			source_id = generate_id(row['film_name'])
			target_id = generate_id(row['actor_name'])
			links.append({"source": source_id, "target": target_id})

output = {"nodes":nodes,"links":links}

with open("parsed.json", "w") as outfile:
	json.dump(output, outfile, indent=4)

more_than_one_actor = []
last_movie = ""
last_actor = ""

for link in links:
	if link["source"] in more_than_one_actor:
		pass
	elif link["source"] == last_movie and link["target"] != last_actor:
		more_than_one_actor.append(link["source"])
	else:
		last_movie = link["source"]
		last_actor = link["target"]

new_nodes = []
for node in nodes:
	if node["id"] in more_than_one_actor or node["type"] == "actor":
		new_nodes.append(node)

nodes = new_nodes

new_links = []
for link in links:
	if link["source"] in more_than_one_actor :
		new_links.append(link)

links = new_links

output = {"nodes":nodes,"links":links}

with open("parsedcommon.json", "w") as outfile:
	json.dump(output, outfile, indent=4)

#

# Show all actors in common movies

#

with open('freebase_performances.csv') as csvfile:
	reader = csv.DictReader(csvfile)
	for row in reader:
		if generate_id(row['film_name']) in more_than_one_actor: #and row['film_name'] in films_list:	
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
		if generate_id(row['film_name']) in more_than_one_actor: #and row['film_name'] in films_list:		
			source_id = generate_id(row['film_name'])
			target_id = generate_id(row['actor_name'])
			links.append({"source": source_id, "target": target_id})

output = {"nodes":nodes,"links":links}

with open("showmovies.json", "w") as outfile:
	json.dump(output, outfile, indent=4)


