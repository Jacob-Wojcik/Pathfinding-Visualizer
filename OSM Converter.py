import os
import xml.etree.ElementTree as ET
import lzma

def read_osm(osm_file):
    adjacency_list = {}
    with lzma.open(osm_file, 'rb') as f:
        tree = ET.parse(f)
        root = tree.getroot()
        # Process the parsed XML data
        for node in root.findall('.//node'):
            node_id = node.attrib['id']
            lat = float(node.attrib['lat'])
            lon = float(node.attrib['lon'])
            adjacency_list[node_id] = {'lat': lat, 'lon': lon, 'neighbors': []}
        # Rest of your code
    return adjacency_list

# Example usage
file_name = 'TESTFILE.osm.xz'
file_path = os.path.abspath(file_name)

adj_list = read_osm(file_path)
print(adj_list)


