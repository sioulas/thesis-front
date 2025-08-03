export interface Pollution {
  type: 'Feature'
  geometry: {
    type: 'Point'
    coordinates: [number, number]
  }
  properties: {
    id: number
    region: string
    pollutant: string
    concentration: number
    date: string
  }
}

export interface PollutionGeoJSON {
  type: 'FeatureCollection'
  features: Pollution[]
}

