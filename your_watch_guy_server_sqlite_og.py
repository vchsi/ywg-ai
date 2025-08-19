from flask import Flask, request, jsonify, render_template
import os
from flask import send_from_directory
import random
from ai_connector import processCustomerJSON, initializeGenai
from flask import send_file
import threading
import json
from GCSE_image_search import GCSEClient

# socketio import
from flask_socketio import SocketIO, send, emit, join_room, leave_room

# db import
from DBWriter import YWGDBWriter, DBWriter

# your_watch_guy_server.py
database_path = os.path.join(os.path.dirname(__file__), 'temp.json')
#data_dict = read_json(database_path)
#content = data_dict["content"]
# setup
system_instructions = initializeGenai()
myClient = GCSEClient()
print("== GCSEClient and GENAiClient Done ==")
db_path = "ywg_db"
dbWriter = YWGDBWriter(db_path)

def generate_random_id():
    curId = random.randint(1000, 9999)
    while curId in data_dict["used_ids"]:
        curId = random.randint(1000, 9999)
    data_dict["used_ids"].append(curId) #obselete
    write_json(database_path, data_dict)
    return curId

def generateReportForId(db_connection, id, id_data, system_instructions):
    #Indicate report is in progress so we wont have to generate it twice
    

    #try:
    print("Report started generating now.")
    #print(id_data)
    reportData = json.loads(processCustomerJSON(id_data, system_instructions[0], system_instructions[1], system_instructions[2]))
    print("Report done! Getting images now. (3)")

    socketMessage(id, "Report almost done! Making final touches.")
    # get images for the report
    
    i = 0
    for watch in reportData["output"]:
        #print("start of image generation loop", watch)
        fullWatchName = "{watchMake} {watchModel} ({refNo})".format(watchMake=watch["watch_brand"], watchModel=watch["watch_model"], refNo=watch["watch_ref_no"])
        query = "{watchName} watch product photo".format(watchName = fullWatchName)
        print("getting images for ", query)
        try:
            result = myClient.watchImageSearch(query)

            # If no results found, the ref no is probably too specific. Try without it
            if(len(result) == 0):
                print("No images found for this query. Trying alternate query.")
                query = "{watchMake} {watchModel} watch product photo".format(watchMake=watch["watch_brand"], watchModel=watch["watch_model"])
                result = myClient.watchImageSearch(query)
            imagesList = []
            for resultTuple in result:
                # resultTuple format: item["link"], item["snippet"], item["displayLink"]
                di = {"title": resultTuple[1], "source": resultTuple[2], "url": resultTuple[0]}
                imagesList.append(di)
        except Exception as e:
            print("images failed for", query, ". Will leave empty")
            print("Exception, ", str(e))
            imagesList = []
        watch["images"] = imagesList
        reportData["output"][i] = watch
        i+=1

    db_connection.load_report(id, reportData)
    db_connection.change_report_credits(id)
        
    #except Exception as e:
    #    print("Report failed at generateReportForId() - reason: ", str(e))
    
    db_connection.update_report_status(id, False)

    # update report to true
    db_connection.update_columns("ywg_tracker_table", id, {"report": True})
    print("Report for ", id, "done.")
    return
    
# Thread to generate reports independently from web server operations
class ReportThread(threading.Thread):
    def __init__(self, dbWriter: DBWriter, id: int, content: dict, system_instructions):
        super(ReportThread, self).__init__()
        self.name = id+"_report_thread"
        self.dbwriter = dbWriter
        self.id = id
        self.content = content
        self.system_instructions = system_instructions
    def run(self):
        socketMessage(self.id, "Your report has started generating.")
        generateReportForId(db_connection=self.dbwriter, id=self.id, id_data=self.content, system_instructions=self.system_instructions)
        print("report done. (thread) Getting images")
        report_done(self.id)


app = Flask(__name__)
socketio = SocketIO(app)
connected_users = {}

# Display sites
@app.route('/', methods=['GET'])
def index():
    return render_template('index.html')
@app.route('/howitworks', methods=['GET'])
def about():
    return render_template('aboutywg.html')
# Demo report for new useres
@app.route('/demoreport', methods=['GET'])
def demo():
    return render_template("gauge_tests.html")
@app.route('/findyourwatch', methods=['GET'])
def initialQuiz():
    return render_template('ywg_initial_survey.html')
@app.route('/login', methods=['GET'])
def loginRender():
    return render_template('login.html')
@app.route('/results', methods=['GET'])
def loadResults():
    return render_template('ywg_result.html')
@app.route('/see_report', methods=['GET'])
def seeReport():
    return render_template('ywg_report.html')

#API
@app.route('/<path:filename>', methods=['GET'])
def serve_static(filename):
    # Serve JS, CSS, or other static files from the templates directory
    templates_dir = os.path.join(app.root_path, 'templates')
    if os.path.exists(os.path.join(templates_dir, filename)):
        return send_from_directory(templates_dir, filename)
    return "File not found", 404

@app.route('/resources/<path:filename>', methods=['GET'])
def return_file(filename):
    print(filename)
    images_dir = os.path.join(app.root_path, 'resources')
    if(os.path.exists(os.path.join(images_dir, filename))):
        return send_file(os.path.join(images_dir, filename))
    return "File not found", 404

# Works
@app.route('/api/submitpart1', methods=['POST'])
def submit_part1():
    request_data = request.get_json()
    content = request_data.get('content', '')
    if isinstance(content, str):
        content = json.loads(content)

    # try to save the data to db
    try:
        curId = dbWriter.new_watch_id(content) # no id given, so the new id will be returned by dbwriter
    except Exception as e:
        print("Error saving to database:", str(e))
        return jsonify({"status": "error", "message": "Failed to save data to database."}), 500
    

    return jsonify({"status": "success", "message": "Part 1 submitted successfully.", "id": curId})

# Seems like it works so far...
@app.route('/api/submitpart2', methods=['POST'])
def submit_part2():
    request_data = request.get_json() 
   # try:
    print(request_data)
    curId = request_data["id"]
    result = dbWriter.submit_part_2(request_data, id=curId)
    if(result["success"]):
        # set as failure so it won't redirect since report page isn't done yet.
        return jsonify({"status": "success", "message": "Part 2 submitted successfully. ", "id": curId})
# print(content)
    else:
        return jsonify({"status": "failure", "message": f"{result['message']}"})
    
        
    # except Exception as e:
        return jsonify({"status": "failure", "message": str(e)})

@app.route('/api/generatereport', methods=['POST'])
def generateReport():
    request_data = request.get_json() # expected input: {"id": INTEGER}
    curId = request_data.get('id', None)
    if curId is None or not dbWriter.check_id(int(curId))["success"]:
        return jsonify({"status": "error", "message": "Invalid ID"}), 400
    id_data = dbWriter.return_all_data_by_id(curId, returnreports=False)
    report_being_generated = dbWriter.check_report_generation(int(curId))
    if(report_being_generated["success"] == False):
        return ({"status": "error", "message": f"failure to generate report. {report_being_generated['message']}"})
    try:
        reportWorker = ReportThread(dbWriter, curId, id_data, system_instructions)
        reportWorker.start()
        return jsonify({"status": "success", "message": "Report has started."}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": "Failed with exception " + str(e)}), 400
    
#Done - works fine (so far)
@app.route('/api/getreportbyid', methods=['POST'])
def getReportById():
    request_data = request.get_json() # expected input: {"id": INTEGER, "reportno": INTEGER}
    curId = request_data.get('id', None)
    requestedReportNo = request_data.get('requested_report_no', None)
    if curId is None or dbWriter.check_id(curId)["success"] == False:
        return jsonify({"status": "error", "message": "ID Doesn't exist"}), 400
    try:
        id_data = dbWriter.return_all_data_by_id(curId, returnreports=True, reportcycle=int(requestedReportNo))
        return jsonify({"status": "success", "content": id_data["report"], "credits": id_data["report_credits"], "times": id_data["report_generated_times"]}), 200
    except Exception as error:
        return jsonify({"status": "error", "message": "Report for id {id} not found: {error}".format(id=curId, error=error)})
    
# Works
@app.route('/api/verifyid', methods=['POST'])
def verify_id():
    request_data = request.get_json()
    curId = request_data.get('id', None)
    if curId is None or not curId.isnumeric():
        return jsonify({"status": "error", "message": "Invalid ID"}), 400
    
    content = dbWriter.check_id(curId)
    if not content["success"]:
        return jsonify({"status": "error", "message": content["message"]}), 400
    else:
        return jsonify({"status": "success"}), 200

# Works
@app.route('/api/getcontentbyid', methods=['POST'])
def get_content_by_id():
    request_data = request.get_json()
    curId = request_data.get('id', None)
    content = dbWriter.verify_id(curId)
    #print(content)
    if not content["success"]:
        return jsonify({"status": "error", "message": content["message"]}), 400
    else:
        return jsonify({"status": "success", "message": content["message"], "content": content["content"]}), 200
    # content = data_dict["content"][str(curId)]
    # return jsonify({"status": "success", "content": content}), 200

# Works
@app.route('/api/loginwithid', methods=['POST'])
def login_with_id():
    request_data = request.get_json()
    curId = request_data.get('id', None)
    print("Verifying", curId)
    if(curId is None):
        return jsonify({"status": "error", "message": "ID is required"}), 400
    if not curId.isdigit() or not dbWriter.check_id(int(curId))["success"]:
        return jsonify({"status": "error", "message": "Invalid ID"}), 400
    
    return jsonify({"status": "success", "id": request_data.get('id', None)}), 200

@app.route('/api/regeneratereport', methods=['POST'])
def regenerate_report():
    request_data = request.get_json() # expected input: {"id": INTEGER}
    curId = request_data.get('id', None)

    idVerified = dbWriter.verify_id(curId)
    if(not idVerified["success"]):
        return jsonify({"status": "error", "message": f"Invalid ID. {idVerified['message']}"}), 400
    
    content = idVerified["content"]

    if(content["report_credits"] < 1):
        return jsonify({"status": "error", "message": f"Report credits depleted. Try again later."}), 400
    
    # if everything else goes, regenerate report
    dbWriter.reset_report_generation(curId)
    return jsonify({"status": "success", "message": "Report regeneration underway."})

    """
    if curId is None or int(curId) not in data_dict["used_ids"]:
        return jsonify({"status": "error", "message": "Invalid ID"}), 400
    id_data = data_dict["content"][curId]
    if("report_in_progress" in id_data.keys()):
        return jsonify({"status": "error", "message": "Report is already generating. Please wait."}), 400
    if("report_generated" not in id_data.keys() or id_data["report_generated"] == False):
        return jsonify({"status": "error", "message": "Report for id {id} not generated yet or invalid".format(id=curId)}), 400
    if(id_data["report_credits"] <= 0):
        return jsonify({"status": "error", "message": "No report credits left for id {id}".format(id=curId)}), 400
    
    content[str(curId)]["report_generated"] = False
    del content[str(curId)]["report"]
    write_json(database_path, data_dict)
    """
    return jsonify({"status": "failure", "message": "Report regeneration not ready yet."}), 400

## SocketIO Section ##
@socketio.on('join')
def report_being_generated(id):
    connected_users[id] = request.sid
    join_room(id)
    print(id, type(id))

def socketMessage(id, message):
    if(id in connected_users.keys()):
        socketio.emit('message', message, room=id)

def report_done(id):
    if(id in connected_users.keys()):
        del connected_users[id]
        socketio.emit('refresh', room=id)
    



if __name__ == '__main__':
    app.run(debug=True)
