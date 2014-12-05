import csv, json, pprint

current_film = ""
actorsinfilm = []
nodes=[]
links=[]


with open('filtered.csv') as csvfile:
	reader = csv.DictReader(csvfile)
	for row in reader:
		if {"name":row["actor_name"]} not in nodes:
			nodes.append({"name":row["actor_name"]})
		if row["film_name"] != current_film:

			length = len(actorsinfilm)
			if length > 1:
				for idx in range(0, length):
					for x in range(idx+1,length):
						links.append({"source":actorsinfilm[idx],"target":actorsinfilm[x]})

			current_film = row["film_name"]
			del actorsinfilm[:]
			actorsinfilm.append(row["actor_name"])
		else:
			actorsinfilm.append(row["actor_name"])

for idx in range(0, len(links)):
	for x in range(1, len(links)):
		if links[idx]["source"] == links[x]["target"] and links[idx]["target"] == links[x]["source"]:
			links[x]["source"] = links[idx]["source"]
			links[x]["target"] = links[idx]["target"]
			break

new_links=[]
for link in links:
	new_links.append({"source":nodes.index({"name": link["source"]}),"target":nodes.index({"name":link["target"]}),"value":links.count(link)})

links = []
for link in new_links:
	if link not in links:
		links.append(link)

output = {"nodes":nodes,"links":links}

with open("adjmat.json", "w") as outfile:
	json.dump(output, outfile, indent=4)
