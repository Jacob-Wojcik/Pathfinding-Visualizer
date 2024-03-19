# About 
We are developing a pathfinding visualizer, based on the project above:
https://github.com/0kzh/pathfinding-visualizer?tab=readme-ov-file

This application will allow analysis and observation of pathfinding using several different algorithms.

## Getting Started
### What you need
You will need to download Node.js and npm. Node.js is an open-source cross-platform, Javascript runtime enviroment. npm is the default package manager for Javascript's runtime Node.js

Learn more about Node.js and npm here:
- https://nodejs.org/en - official Node.js Docs
- https://www.freecodecamp.org/news/what-is-npm-a-node-package-manager-tutorial-for-beginners/ 
- https://docs.npmjs.com/downloading-and-installing-node-js-and-npm - installation guide


Once you have successfully downloaded Node.js and npm

### Clone the repository
Clone the remote repository in a folder on your local machine using: 
```bash 
git clone https://github.com/rKamindo/pathfinding-visualizer
```
Navigate to the folder where the repository was cloned.

### Running locally
First install all the dependencies of the project:
```bash
npm install
```

Next, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application running on your local machine

## How to generate the data
To generate the data for pathfinding, follow these steps:

1. **Download OSM Data**: Visit [BBBike](https://extract.bbbike.org/) and select your desired region or area of interest. Choose the format "OSM PBF raw data" and download the file for the location you wish.

## Running the script that creates an adjacency list out of the data
To run the pathfinding script, follow these steps:

1. Ensure you have Python installed on your system. If not, you can download and install it from the [official Python website](https://www.python.org/downloads/).

2. Clone or download the repository containing the script to your local machine.

3. Navigate to the directory containing the map_parser.py script
    ```bash
    cd scripts
    ```

4. **Run the following command** in your terminal to install the required dependencies listed in the `requirements.txt` file:

    ```bash
    pip install -r requirements.txt
    ```

5. **Run the script**: Execute the map parser script with the OSM PBF file as input.
    (For convenience, I )
    ```bash
   python map_parser.py <osm_file>
## Technologies
Next.js, React, Typescript

## Learn More
- [Leaflet](https://leafletjs.com/reference.html) - learn about Leaflet
- [React Leaftlet](https://react-leaflet.js.org/) - learn more about React Leaflet
- [React Documentation](https://react.dev/) - learn about React
- [Learn React](https://nextjs.org/learn/react-foundations/what-is-react-and-nextjs) - learn the foundations of React
- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
