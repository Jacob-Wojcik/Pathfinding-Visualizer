import xml.etree.ElementTree as ET
import lzma
import json
from collections import deque

def read_osm(osm_file):
    adjacency_list = {}
    with lzma.open(osm_file, 'rb') as f:
        tree = ET.parse(f)
        root = tree.getroot()
        # Extract nodes and their coordinates
        for node in root.findall('node'):
            node_id = node.attrib['id']
            lat = float(node.attrib['lat'])
            lon = float(node.attrib['lon'])
            adjacency_list[node_id] = {'lat': lat, 'lon': lon, 'neighbors': []}
        # Extract ways and their nodes (to build neighbors list)
        for way in root.findall('way'):
            way_nodes = [nd.attrib['ref'] for nd in way.findall('nd')]
            for i in range(len(way_nodes) - 1):
                node1 = way_nodes[i]
                node2 = way_nodes[i + 1]
                if node1 not in adjacency_list[node2]['neighbors']:
                    adjacency_list[node2]['neighbors'].append(node1)
                if node2 not in adjacency_list[node1]['neighbors']:
                    adjacency_list[node2]['neighbors'].append(node2)
    return adjacency_list

# Example usage
file_name = 'TESTFILE.osm.xz'

def extract_largest_connected_graph(graph: dict):
    # initialize queue, visited set
    visited = set()
    cc = {}

    def bfs(v):
        queue = deque([v])
        while queue:
            for neighbor in queue[0]:
                if neighbor not in visited:
                    visited.add(neighbor)
                    queue.append(neighbor)
                queue.popleft()
    
    for node in graph:
        if node not in visited:
            bfs(node)
        cc[node] = visited
        print(cc[node])
        
   


adj_list = read_osm(file_name)
with open('data.json', 'w') as outfile:
    json.dump(adj_list, outfile)

extract_largest_connected_graph(adj_list)

