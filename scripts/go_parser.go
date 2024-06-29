package main

import (
	"context"
	"encoding/json"
	"fmt"
	"math"
	"os"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/gammazero/deque"
	"github.com/paulmach/osm"
	"github.com/paulmach/osm/osmpbf"
)

var DefaultSpeeds = map[string]int{
	"motorway":       70,
	"trunk":          60,
	"primary":        60,
	"secondary":      45,
	"tertiary":       35,
	"unclassified":   55,
	"residential":    25,
	"living_street":  25,
	"service":        25,
	"motorway_link":  45,
	"trunk_link":     35,
	"primary_link":   30,
	"secondary_link": 30,
	"tertiary_link":  35,
}

type RoutingGraph struct {
	sync.RWMutex
	Data map[string]*NodeInfo `json:"-"`
}

type RoutingGraphJSON struct {
	Data map[string]*NodeInfo `json:"-"`
}

// Node represents a node in the graph
type NodeInfo struct {
	Lat      float64 `json:"lat"` // Latitude coordinate of the node
	Lon      float64 `json:"lon"` // Longitude coordinate of the node
	Adjacent []*Edge `json:"adj"` // Slice of pointers to other nodes adjacent to this node
}

// Edge represents an edge between two nodes in the graph.
type Edge struct {
	NodeID   string  `json:"nodeId"`
	Distance float64 `json:"distance"`
	Time     float64 `json:"time"`
}

func ReadOsm(osmFile string) (*RoutingGraph, error) {
	file, err := os.Open(osmFile)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	scanner := osmpbf.New(context.Background(), file, 3)

	graph := &RoutingGraph{Data: make(map[string]*NodeInfo)}

	for scanner.Scan() {
		obj := scanner.Object()
		switch o := obj.(type) {
		case *osm.Node:
			// Handle nodes here
			nodeID := strings.TrimPrefix(o.ID.FeatureID().String(), "node/")
			node := &NodeInfo{Lat: o.Lat, Lon: o.Lon, Adjacent: make([]*Edge, 0)}
			graph.Data[nodeID] = node
		case *osm.Way:
			if isDrivableHighway(o) {
				nodes := o.Nodes
				isOneWay := o.Tags.Find("oneway") == "yes" || o.Tags.Find("oneway") == "true" || o.Tags.Find("oneway") == "1"
				for i := 0; i < len(nodes)-1; i++ {
					node1ID := strings.TrimPrefix(nodes[i].ID.FeatureID().String(), "node/")
					node2ID := strings.TrimPrefix(nodes[i+1].ID.FeatureID().String(), "node/")
					node1 := graph.Data[node1ID]
					// Check if node1 already exists in the graph
					if _, exists := graph.Data[node1ID]; !exists {
						node1 = &NodeInfo{Lat: nodes[i].Lat, Lon: nodes[i].Lon, Adjacent: make([]*Edge, 0)}
						graph.Data[node1ID] = node1
					}
					node2 := graph.Data[node2ID]
					// Check if node2 already exists in the graph
					if _, exists := graph.Data[node2ID]; !exists {
						node2 = &NodeInfo{Lat: nodes[i+1].Lat, Lon: nodes[i+1].Lon, Adjacent: make([]*Edge, 0)}
						graph.Data[node2ID] = node2
					}

					distance := haversine(node1.Lat, node1.Lon, node2.Lat, node2.Lon)

					// Calculate the time it takes to travel between the adjacent nodes
					maxSpeed := getMaxSpeed(o)
					time := distance / maxSpeed // Time in hours

					edge := &Edge{
						NodeID:   node2ID,
						Distance: distance,
						Time:     time,
					}

					// Add edge to node1's adjacency list
					graph.Lock()
					node1.Adjacent = append(node1.Adjacent, edge)
					graph.Unlock()

					// If not one-way, add reverse edge
					if !isOneWay {
						revEdge := &Edge{
							NodeID:   node1ID,
							Distance: distance,
							Time:     time,
						}
						graph.Lock()
						node2.Adjacent = append(node2.Adjacent, revEdge)
						graph.Unlock()
					}
				}
			}
		}
	}

	fmt.Println("There are", len(graph.Data), "nodes")
	return graph, nil
}

// Define the desired highway types
var desiredHighwayTypes = map[string]bool{
	"motorway":       true,
	"trunk":          true,
	"primary":        true,
	"secondary":      true,
	"tertiary":       true,
	"unclassified":   true,
	"residential":    true,
	"motorway_link":  true,
	"trunk_link":     true,
	"primary_link":   true,
	"secondary_link": true,
	"tertiary_link":  true,
	"living_street":  true,
	"service":        true,
}

// Function to check if the given way is one of the desired highway types
func isDrivableHighway(way *osm.Way) bool {
	highwayType := way.Tags.Find("highway")
	return desiredHighwayTypes[highwayType]
}

// getMaxSpeed returns the maximum speed for the given highway type.
func getMaxSpeed(way *osm.Way) float64 {
	maxSpeed := way.Tags.Find("maxspeed")
	if maxSpeed != "" {
		if strings.Contains(maxSpeed, "mph") {
			speedStr := strings.TrimSuffix(maxSpeed, "mph")
			speedStr = strings.TrimSpace(speedStr)
			speed, err := strconv.Atoi(speedStr)
			if err != nil {
				// Handle the error if conversion fails
				panic(err)
			}
			return float64(speed)
		} else if strings.Contains(maxSpeed, "km/h") {
			speedStr := strings.TrimSuffix(maxSpeed, " km/h")
			speed, _ := strconv.Atoi(speedStr)
			if speed == 0 {
				panic(speed)
			}
			return float64(speed) / 1.60934
		}
	}
	speed := float64(DefaultSpeeds[way.Tags.Find("highway")])
	if speed == 0 {
		panic(speed)
	}
	return speed
}

// Haversine calculates the distance between two coordinates using Haversine formula.
func haversine(lat1, lon1, lat2, lon2 float64) float64 {
	const earthRadius = 3958.8 // Earth radius in miles
	dLat := toRadians(lat2 - lat1)
	dLon := toRadians(lon2 - lon1)

	a := math.Pow(math.Sin(dLat/2), 2) + math.Cos(toRadians(lat1))*math.Cos(toRadians(lat2))*math.Pow(math.Sin(dLon/2), 2)
	c := 2 * math.Atan2(math.Sqrt(a), math.Sqrt(1-a))
	return earthRadius * c
}

// toRadians converts degrees to radians.
func toRadians(deg float64) float64 {
	return deg * (math.Pi / 180)
}

func ExtractLargestConnectedGraph(graph *RoutingGraph) *RoutingGraph {
	fmt.Println("Extracting the largest component...")

	discovered := make(map[string]bool)
	largestComponent := make(map[string]*NodeInfo)

	for nodeID := range graph.Data {
		if !discovered[nodeID] {
			// Start BFS from unvisited nodes
			component := make(map[string]*NodeInfo)
			queue := deque.New[string]()
			queue.PushBack(nodeID)
			for queue.Len() > 0 {
				currentID := queue.PopFront()
				currentNode := graph.Data[currentID]

				component[currentID] = currentNode
				discovered[currentID] = true

				for _, neighbor := range currentNode.Adjacent {
					if !discovered[neighbor.NodeID] {
						queue.PushBack(neighbor.NodeID)
						discovered[neighbor.NodeID] = true
					}
				}
			}

			if len(component) > len(largestComponent) {
				largestComponent = component
			}
		}
	}

	// Now 'largestComponent' contains the largest connected component
	fmt.Println("Extraction complete, there are", len(largestComponent), "nodes")
	return &RoutingGraph{Data: largestComponent}
}

func (rg *RoutingGraph) MarshalJSON() ([]byte, error) {
	return json.Marshal(&RoutingGraphJSON{
		Data: rg.Data,
	})
}

func main() {
	numRuns := 10 // Set the desired number of runs
	totalElapsed := time.Duration(0)
	for i := 0; i < numRuns; i++ {
		// Start timing
		fmt.Println("Reading in OSM data")

		start := time.Now()
		graph, err := ReadOsm("annarbor.osm.pbf")
		if err != nil {
			fmt.Println("Error reading OSM file:", err)
			return
		}
		// Extract the largest connected component
		largestSubgraph := ExtractLargestConnectedGraph(graph)

		// Encode the largestSubgraph into JSON
		jsonData, err := json.Marshal(largestSubgraph.Data)
		if err != nil {
			fmt.Println("Error encoding graph data:", err)
			return
		}

		// Write the JSON data to a file
		file, err := os.Create("data.json")
		if err != nil {
			fmt.Println("Error creating file:", err)
			return
		}
		defer file.Close()

		_, err = file.Write(jsonData)
		if err != nil {
			fmt.Println("Error writing JSON data to file:", err)
			return
		}
		elapsed := time.Since(start)
		totalElapsed += elapsed
		fmt.Println("Graph data has been saved")
		fmt.Println("Algorithm execution time:", elapsed)
	}
	avgElapsed := totalElapsed / time.Duration(numRuns)
	fmt.Println("\nAverage execution time over", numRuns, "runs:", avgElapsed)
}
