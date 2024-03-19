import sys
from collections import deque
import osmium
import json

"""
    Function to read an OSM file and extract adjacency list data.

    Args:
        osm_file (str): Path to the OSM file.

    Returns:
        dict: Adjacency list representing the graph extracted from the OSM file.
    """
def read_osm(osm_file):
    print('Processing OSM file data...')
    adjacency_list = {}
    class NodeHandler(osmium.SimpleHandler):
        def node(self, n):
            """
            Callback function to handle OSM nodes.

            Args:
                n (osmium.osm.Node): OSM node object.
            """
            adjacency_list[str(n.id)] = {'lat': n.location.lat, 'lon': n.location.lon, 'adj': []}

        def way(self, w):
            """
            Callback function to handle OSM ways.

            Args:
                w (osmium.osm.Way): OSM way object.
            """
            if 'highway' in w.tags:
                highway_type = w.tags['highway']
                if highway_type in ['motorway', 'trunk', 'primary', 'secondary', 'tertiary', 'unclassified', 'residential', 'motorway_link', 'trunk_link', 'primary_link', 'secondary_link', 'tertiary_link']:
                    nodes = w.nodes
                    for i in range(len(nodes) - 1):
                        node1 = str(nodes[i].ref)
                        node2 = str(nodes[i + 1].ref)

                        if node1 not in adjacency_list[node2]['adj']:
                            adjacency_list[node2]['adj'].append(node1)
                        if node2 not in adjacency_list[node1]['adj']:
                            adjacency_list[node1]['adj'].append(node2)

    try:
        handler = NodeHandler()
        handler.apply_file(osm_file)
    except Exception as e:
        print("Error:", e)
    return adjacency_list

def extract_largest_connected_graph(graph: dict):
    print('Extracting the largest component...')
    """
    Function to extract the largest connected component from a graph represented by its adjacency list.

    Args:
        graph (dict): Adjacency list representing the graph.

    Returns:
        dict: Adjacency list representing the largest connected component.
    """
    visited = set()
    largest_component = set()  # Initialize as a set to store nodes

    def bfs(v):
        """
        Breadth-first search algorithm to traverse the graph and find connected components.

        Args:
            v: Starting node for BFS.
        """
        queue = deque([v])
        component = set()  # Initialize set to store nodes in the current component
        while queue:
            current_node = queue.popleft()
            visited.add(current_node)
            component.add(current_node)  # Add current node to the current component
            for neighbor in graph[current_node]['adj']:
                if neighbor not in visited:
                    queue.append(neighbor)
        return component

    for node in graph:
        if node not in visited:
            component = bfs(node)
            if len(component) > len(largest_component):
                largest_component = component  # Update largest component if current component is larger
    
    largest_component_graph = {n: graph[n] for n in largest_component}  # Build largest subgraph            

    print("Size of the largest component:", len(largest_component_graph), 'nodes')
    return largest_component_graph

if __name__ == '__main__':
    if len(sys.argv) != 2:
        print("Usage: map_parser <osm_file>")
        sys.exit(1)

    output_file = input('Enter the output file name (should be a .json): ')
    print('Running...')
    file_name = sys.argv[1]
    adj_list = read_osm(file_name)
    largest_component = extract_largest_connected_graph(adj_list)
    with open(f'../public/data/{output_file}', 'w') as outfile:
        json.dump(largest_component, outfile)
        print(f'Generating {output_file}')
    print(f'Processing complete.')