    import datetime as dt
import numpy as np
import pandas as pd

import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, func, inspect, desc

from flask import Flask, render_template, jsonify, redirect

engine = create_engine("sqlite:///DataSets/belly_button_biodiversity.sqlite")
Base = automap_base()
Base.prepare(engine, reflect=True)
Otu = Base.classes.otu
Samples = Base.classes.samples
Samples_metadata = Base.classes.samples_metadata
session = Session(engine)

app = Flask(__name__)

@app.before_first_request
def setup():
    pass

@app.route("/")
def welcome():
    # Return to the dashboard
    return render_template("index.html")

@app.route("/names")
def names():
    # """List of sample names.
    #     Returns a list of sample names in the format
    #     [
    #         "BB_940",
    #         "BB_941",
    #         "BB_943",
    #         "BB_944",
    #         "BB_945",
    #         "BB_946",
    #         "BB_947",
    #         ...
    #     ]
    all_names = []
    for row in inspect(engine).get_columns("Samples")[1:]:
        all_names.append(row["name"])

    return jsonify(all_names)


@app.route('/otu')
def otu():
    #     List of OTU descriptions.
    #     Returns a list of OTU descriptions in the following format
    #     [
    #         "Archaea;Euryarchaeota;Halobacteria;Halobacteriales;Halobacteriaceae;Halococcus",
    #         "Archaea;Euryarchaeota;Halobacteria;Halobacteriales;Halobacteriaceae;Halococcus",
    #         "Bacteria",
    #         "Bacteria",
    #         "Bacteria",
    #         ...
    #     ]
    otu_list = []
    for row in session.query(Otu).all():
        otu_list.append(row.lowest_taxonomic_unit_found)
    
    return jsonify(otu_list)


@app.route('/metadata/<sample>')
def metadata(sample):
    #     MetaData for a given sample.
    #     Args: Sample in the format: `BB_940`
    #     Returns a json dictionary of sample metadata in the format
    #     {
    #         AGE: 24,
    #         BBTYPE: "I",
    #         ETHNICITY: "Caucasian",
    #         GENDER: "F",
    #         LOCATION: "Beaufort/NC",
    #         SAMPLEID: 940
    #     }
    sliced = sample[3:]
    for meta in session.query(Samples_metadata.AGE, Samples_metadata.BBTYPE, Samples_metadata.ETHNICITY, Samples_metadata.GENDER, Samples_metadata.LOCATION, Samples_metadata.SAMPLEID).all():
        search_term = str(meta[5])
        if sliced == search_term:
            return jsonify({"AGE": meta[0],
           "BBTYPE": meta[1],
           "ETHNICITY": meta[2],
           "GENDER": meta[3],
           "LOCATION": meta[4],
           "SAMPLEID": meta[5]})
        
    return jsonify({"error": f"Sample with id {sample} not found."}), 404

@app.route('/wfreq/<sample>')
def wfreq(sample):
#     Weekly Washing Frequency as a number.
#     Args: Sample in the format: `BB_940`
#     Returns an integer value for the weekly washing frequency `WFREQ`
    sliced = sample[3:]
    for meta in session.query(Samples_metadata):
        search_term = str(meta.SAMPLEID)
        if sliced == search_term:
            return jsonify(meta.WFREQ)
    
    return jsonify({"error": f"Sample with id {sample} not found."}), 404

@app.route('/samples/<sample>')
def samples(sample):
    otu_list = []
    sample_values_list = []
    results = session.query(Samples).filter(getattr(Samples, sample) > 0).order_by(desc(getattr(Samples, sample)))
    for row in results:
        otu_list.append(row.otu_id)
        sample_values_list.append(getattr(row, sample))
    return jsonify([{"otu_ids": otu_list, "sample_values": sample_values_list}])
#     OTU IDs and Sample Values for a given sample.
#     Sort your Pandas DataFrame (OTU ID and Sample Value)
#     in Descending Order by Sample Value
#     Return a list of dictionaries containing sorted lists  for `otu_ids`
#     and `sample_values`
#     [
#         {
#             otu_ids: [
#                 1166,
#                 2858,
#                 481,
#                 ...
#             ],
#             sample_values: [
#                 163,
#                 126,
#                 113,
#                 ...
#             ]
#         }
#     ]


if __name__ == "__main__":
    app.run(debug=True)