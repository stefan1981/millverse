#!/bin/bash

cat gemeinden_simplify200.geojson | \
jq '.features |
    map(
        if .properties.GEN == "Fischbach" then
          {
            name: .properties.GEN,
            type: .properties.BEZ,
            AGS: .properties.AGS,
            ARS: .properties.RS,
            longitude: .properties.destatis.center_lon,
            latitude: .properties.destatis.center_lat,
            population: .properties.destatis.population,
            coord: .geometry,
            all: .properties
          }
        else
          empty
        end
    )'