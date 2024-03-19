import sys
import os
from collections import deque
import osmium
from haversine import haversine, Unit
import json

"""
    Function to read an OSM file and extract adjacency list data.

    Args:
        osm_file (str): Path to the OSM file.

    Returns:
        dict: Adjacency list representing the graph extracted from the OSM file.
    """
# Dictionary mapping highway types to their default maximum speeds in miles per hour 
default_speeds = {
    "motorway": 70,
    "trunk": 60,
    "primary": 60,
    "secondary": 45,
    "tertiary": 35,
    "unclassified": 55,
    "residential": 25,
    "living_street": 25,
    "service": 25,
    "motorway_link": 45,
    "trunk_link": 35,
    "primary_link": 30,
    "secondary_link": 30,  
    "tertiary_link": 35,   
}

def read_osm(osm_file):
    print('Processing OSM file data...')
    routing_graph = {}
    class NodeHandler(osmium.SimpleHandler):
        
        def node(self, n):
            """
            Callback function to handle OSM nodes.

            Args:
                n (osmium.osm.Node): OSM node object.
            """
            routing_graph[str(n.id)] = {'lat': n.location.lat, 'lon': n.location.lon, 'adj': []}

        def way(self, w):
            """
            Callback function to handle OSM ways.

            Args:
                w (osmium.osm.Way): OSM way object.
            """
            if 'highway' in w.tags:
                highway_type = w.tags['highway']
                if highway_type in ['motorway', 'trunk', 'primary', 'secondary', 
                                    'tertiary', 'unclassified', 'residential', 
                                    'motorway_link', 'trunk_link', 'primary_link', 
                                    'secondary_link', 'tertiary_link', 'living_street', 'service']:
                    nodes = w.nodes

                    # determine if the way is one-way
                    is_one_way = 'oneway' in w.tags and w.tags['oneway'] in ['yes', 'true', '1']
                    for i in range(len(nodes) - 1):
                        node1_id = str(nodes[i].ref)
                        node2_id = str(nodes[i + 1].ref)

                        # get the coordinates of the two nodes adjacent to each other
                        lat1, lon1 = routing_graph[node1_id]['lat'], routing_graph[node1_id]['lon']
                        lat2, lon2 = routing_graph[node2_id]['lat'], routing_graph[node2_id]['lon']

                        # calculate Haversine distance in miles
                        distance = haversine((lat1, lon1), (lat2, lon2), unit=Unit.MILES)

                        # calulate the time it takes to travel between the adjacent nodes
                        max_speed = self.get_max_speed(w, highway_type)
                        time = distance / max_speed # time in hours
                        if node2_id not in routing_graph[node1_id]['adj']: 
                            routing_graph[node1_id]['adj'].append({'nodeId': node2_id, 'distance': distance, 'time': time})

                        if not is_one_way and node1_id not in routing_graph[node2_id]['adj']:
                            routing_graph[node2_id]['adj'].append({'nodeId': node1_id, 'distance': distance, 'time': time})


        def is_node_in_adj(self, graph, node_id, target_node_id):
            """
            Function to check if a target node is in the adjacency list of a given node.

            Args:
                graph (dict): Adjacency list representing the graph.
                node_id (str): The node id to check.
                target_node_id (str): The target node id to search for in the adjacency list.

            Returns:
                bool: True if the target node is found in the adjacency list of the given node, False otherwise.
            """
            if node_id in graph:
                for neighbor in graph[node_id]['adj']:
                    if neighbor['nodeId'] == target_node_id:
                        return True
            return False
             
                        
        def get_max_speed(self, w, highway_type):
            """
            Helper function to get the maximum speed from OSM way tags.
            If the way tags doesn't contain max speed information, we
            will use the default speeds of the highway type that is 
            defined in a dictionary.

            Args:
                way (osmium.osm.Way): OSM way object.

            Returns:
                int: Maximum speed in mph
            """
            max_speed = w.tags.get('maxspeed', None)
            if max_speed:
                if max_speed.isdigit():
                    # Convert km/h to mph
                    return int(max_speed) / 1.60934
                elif max_speed.endswith(' mph'):
                    return int(max_speed.split(' ')[0]) 
                elif max_speed.endswith(' km/h'):
                    return int(max_speed.split(' ')[0] / 1.60934)
            else:
                return int(default_speeds[highway_type])

    handler = NodeHandler()
    handler.apply_file(osm_file)
    return routing_graph

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
                neighbor_id = neighbor['nodeId']
                if neighbor_id not in visited:
                    queue.append(neighbor_id)
        return component

    for node in graph:
        if node not in visited:
            component = bfs(node)
            if len(component) > len(largest_component):
                largest_component = component  # Update largest component if current component is larger
    
    largest_component_graph = {n: graph[n] for n in largest_component}  # Build largest subgraph            
    
    print("Size of the largest component:", len(largest_component_graph), 'nodes')
    print("Total number of edges:", count_edges(largest_component_graph))
    return largest_component_graph

def count_edges(graph):
    total_edges = 0
    for node_id, node_data in graph.items():
        total_edges += len(node_data['adj'])
    return total_edges

if __name__ == '__main__':
    if len(sys.argv) != 2:
        print("Usage: map_parser <osm_file>")
        sys.exit(1)

    output_file = input('Enter the output file name (should be a .json): ')
    print('Running...')
    file_name = sys.argv[1]
    graph = read_osm(file_name)
    largest_component = extract_largest_connected_graph(graph)
    with open(f'../public/data/{output_file}', 'w') as outfile:
        json.dump(largest_component, outfile)
        print(f'Generating {output_file}')
        file_size = os.path.getsize(f'../public/data/{output_file}')
        file_size_mb = file_size / (1024 * 1024)
        print(f'Size of the generated JSON file: {file_size_mb:.2f} MB')
    print(f'Processing complete.')