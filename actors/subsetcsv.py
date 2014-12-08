import csv

actors_list = ["Will Ferrell", "Steve Carell","Vince Vaughn","David Koechner","Ben Stiller", "Owen Wilson", "Seth Rogen", "Bruce Lee", "Megan Fox", "Paul Rudd", "Leslie Mann", "Chris O'Dowd", "Jason Segel", "Jackie Chan", "Jet Li", "Shia LaBeouf","Leonardo DiCaprio", "Jonah Hill", "Matthew McConaughey", "Brad Pitt", "Christoph Waltz"]

new = []
fieldnames = ["id","actor_name","character","film_name","year"]
rows = []

with open('freebase_performances.csv', 'r') as csvfile:
    reader = csv.DictReader(csvfile)

    for row in reader:
        if row['actor_name'] in actors_list:
            rows.append(row)

with open('filtered.csv', 'w') as fout:
    writer = csv.DictWriter(fout, fieldnames=fieldnames)
    writer.writeheader()
    for row in rows:
        writer.writerow(row)
