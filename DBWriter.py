import sqlite3
import os
import random
import json

class DBWriter:
    def __init__(self, db_path):
        self.YWG_TRACKER_TABLE_COLUMN_NAMES = ['id', 'part1', 'part2', 'report', 'report_credits']
        self.db_path = db_path
        # test if the database exists, if not create it
        try:
            self.getNewConnection()
        except sqlite3.OperationalError:
            print("Database does not exist, creating a new one.")
        
    
    def create_table(self, table_name, columns_array): # columns_array is a list of tuples (column_name, column_type)
        with self.getNewConnection() as conn:
            cursor = conn.cursor()
            # Example table creation, modify as needed
            cursor.execute(f'''
                CREATE TABLE IF NOT EXISTS {table_name} (
                    {', '.join([f"{col[0]} {col[1]}" for col in columns_array])}
                )
            ''')
            conn.commit()
        conn.close()
    
    def write_data(self, table_name, data, ifnotexists=True, conflictCol="id"): # Writes data from list of dictionaries (per row). {column_name: value}
        with self.getNewConnection() as conn:
            try:
                cursor = conn.cursor()
                # Assuming 'data' is a dictionary with keys matching the database columns
                columns = ', '.join(data.keys())
                placeholders = ', '.join(['?'] * len(data))
                sql = f'INSERT INTO {table_name} ({columns}) VALUES ({placeholders})'
                if ifnotexists:
                    sql += f' ON CONFLICT({conflictCol}) DO NOTHING'
                # Execute the SQL command
                
                cursor.execute(sql, tuple(data.values()))
                conn.commit()
            except Exception as e:
                return {"success": False, "message": str(e)}
        conn.close()
        return {"success": True}

    def getNewConnection(self):
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn
    
    
    def read_data(self, table): # Returns data as list of dictionaries (per row). {column_name: value}
        with self.getNewConnection() as conn:
            cursor = conn.cursor()
            cursor.execute(f'SELECT * FROM {table}')
            rows = [dict(row) for row in cursor.fetchall()]
        
        conn.close()
        return rows
    def read_multiple_by_id(self, table, row_id, col_name="id", limit=None):
        with self.getNewConnection() as conn:
            cursor = conn.cursor()
            query = f'SELECT * FROM {table} WHERE {col_name} = ?'
            if(limit):
                query += f" LIMIT {limit};"
            cursor.execute(query, (row_id,))
            rows = cursor.fetchall()
            if rows:
                return [dict(curRow) for curRow in rows]
            else:
                return None
            
    def read_data_by_id(self, table, row_id, col_name="id"):
        with self.getNewConnection() as conn:
            cursor = conn.cursor()
            query = f'SELECT * FROM {table} WHERE {col_name} = ?'
            cursor.execute(query, (row_id,))
            row = cursor.fetchone()
            if row:
                return dict(row)
            else:
                return None
    def check_if_exists(self, table, columnName, value):
        with self.getNewConnection() as conn:
            cursor = conn.cursor()
            cursor.execute(f"SELECT * FROM {table} WHERE {columnName}={value}")
            row = cursor.fetchone()
            if(row):
                return True
            return False
    def update_columns(self, table, row_id, data): # data is dictionary of new columns
        with self.getNewConnection() as conn:
            cursor = conn.cursor()
            set_clause = ', '.join([f"{key} = ?" for key in data.keys()])
            sql = f'UPDATE {table} SET {set_clause} WHERE id = ?'
            cursor.execute(sql, (*data.values(), row_id))
            conn.commit()
        conn.close()
        return "success"
    def drop_row(self, table, row_id, column='id'):
        with self.getNewConnection() as conn:
            cursor = conn.cursor()
            cursor.execute(f'DELETE FROM {table} WHERE {column} = ?', (row_id,))
            conn.commit()
        conn.close()
        return "success"
    # condition is passed in as string (ex: "id=id AND reportid=null")
    def drop_rows_by_condition(self, table, condition):
        with self.getNewConnection() as conn:
            cursor = conn.cursor()
            cursor.execute(f'DELETE FROM {table} WHERE {condition}')
            conn.commit()
        conn.close()
        return "success"
    
    def drop_table(self, table):
        with self.getNewConnection() as conn:
            cursor = conn.cursor()
            cursor.execute(f"DROP TABLE IF EXISTS {table} ;")
        conn.close()
        return "success"
    
    """
    

Goal: To use DBWriter to replace the JSON file (to store data more effectively and efficiently)



"""
class YWGDBWriter(DBWriter):
    YWG_TRACKER_TABLE_COLUMNS = [('id', 'INTEGER PRIMARY KEY'), 
                                     ('part1', 'BOOLEAN'), 
                                     ('part2', 'BOOLEAN'), 
                                     ('report', 'BOOLEAN'),
                                     ('report_in_progress', 'BOOLEAN'), 
                                     ('report_credits', 'INTEGER'), 
                                     ('report_generated_times', 'INTEGER'),
                                     ('step', 'INTEGER')]
    PART1_DATA_COLUMNS = [('id', 'INTEGER PRIMARY KEY'), 
                               ('version', 'NUMERIC'), 
                               ('watchBrand', 'TEXT'), 
                               ('watchModel', 'TEXT'), 
                               ('purchaseDecision', 'TEXT'), 
                               ('additionalInfo', 'TEXT'), 
                               ('specialRequests', 'TEXT'),
                               ('lowerBound', 'INTEGER'), 
                               ('upperBound', 'INTEGER'), 
                               ('pricingStrategy', 'TEXT')]
    PART2_DATA_COLUMNS = [('id', 'INTEGER PRIMARY KEY'), 
                          ('watch_customer_info', 'TEXT'),
                          ('watch_customer_history_experience', 'TEXT'),
                          ('watch_report_features', 'TEXT'),
                          ('customer_desire_sentence', 'TEXT'),
                          ('additional_things_to_include_on_report', 'TEXT')]
    REPORT_DATA_COLUMNS = [('reportid', 'INTEGER PRIMARY KEY'),
                           ('id', 'INTEGER'),
                           ('report_generated_cycle', 'INTEGER'),
                           ('watch_brand', 'TEXT'),
                           ('watch_model', 'TEXT'),
                           ('watch_ref_no', 'TEXT'),
                           ('basic_info', 'TEXT'),
                           ('watch_stats', 'TEXT'),
                           ('watch_fit_criteria', 'TEXT'),
                           ('watch_fit_gauges', 'TEXT'),
                           ('pricing', 'TEXT'),
                           ('FOREIGN KEY (id)', 'REFERENCES ywg_tracker_table (id)')
                           ]
    IMAGES_DATA_COLUMNS = [("reportid", "INTEGER"),
                           ('url', 'TEXT'),
                           ('title', 'TEXT'),
                            ('source', 'TEXT'),
                            ('FOREIGN KEY (reportid)', 'REFERENCES report (reportid)')]
    def __init__(self, db_path):
        super().__init__(db_path)
        self.init_tables()
    
    # create the tables if they do not exist, if they do, nothing happens.
    def init_tables(self):
        self.create_table('ywg_tracker_table', self.YWG_TRACKER_TABLE_COLUMNS)
        self.create_table('part1_data', self.PART1_DATA_COLUMNS)
        self.create_table('part2_data', self.PART2_DATA_COLUMNS)
        self.create_table('report', self.REPORT_DATA_COLUMNS)
        self.create_table('images', self.IMAGES_DATA_COLUMNS)

    def generate_random_id(self, table='ywg_tracker_table', idVal = 'id'):
        curId = random.randint(1000, 9999)
        while self.read_data(table) and any(row[idVal] == curId for row in self.read_data(table)):
            curId = random.randint(1000, 9999)
        return curId  
    
    # same as verify_id, except doesnt return the whole table
    def check_id(self, id):
        print("DbWriter.py - Verifying ID:", id)
        if(not isinstance(id, int)):
          #  return {"success": False, "message": "ID must be a integer."}
            if(not id.isnumeric()):
                return {"success": False, "message": "ID must be a positive integer."}
        if(self.check_if_exists("ywg_tracker_table", "id", id)):
            return {"success": True}
        else:
            return {"success": False, "message": "Id doesn't exist"}

    # verify_id(self, id = integer): Checks if a id is valid and exists in the database. If so, returns content
    # used in server.login_with_id()  
    def verify_id(self, id):
        print("DbWriter.py - Verifying ID:", id)
        if(not isinstance(id, int)):
          #  return {"success": False, "message": "ID must be a integer."}
            if( not id.isnumeric()):
                return {"success": False, "message": "ID must be a positive integer."}
        data_dict = self.return_all_data_by_id(int(id))
        if(not data_dict):
            return {"success": False, "message": "ID does not exist."}
        return {"success": True, "message": "ID is valid.", "content": data_dict}
    
    def new_watch_id(self, data, id=None): # pass in content dictionary from part 1 (ywg_initial_survey.js or submitpart1())
        if(id != None):
            newId = int(id)
        else:
            newId = self.generate_random_id()
        
        self.write_data('ywg_tracker_table', 
                        {'id': newId,
                         'part1': True,
                         'part2': False,
                         'report': False,
                         'report_in_progress': False,
                         'report_credits': 2,
                         'report_generated_times': 0,
                         'step': 2}, True)

        self.write_data('part1_data',
                        {'id': newId,
                        'version': float(data["Version"]),
                         'watchBrand': data["watchBrand"] ,
                         'watchModel': data["watchModel"],
                         "purchaseDecision": data["purchaseDecision"],
                         "additionalInfo": data["additionalInfo"],
                         "specialRequests": data["specialRequests"],
                         "lowerBound": int(data["priceRange"]["lowerBound"]),
                         "upperBound": int(data["priceRange"]["upperBound"]),
                         "pricingStrategy": data["pricingStrategy"]}, True)
        self.update_columns('ywg_tracker_table', newId, {'part1': True, 'step': 2})
        return newId
    def submit_part_2(self, data, id):
        if(id == None):
            return {"success": False, "message": "Invalid ID"}
        cur_content = self.verify_id(id)
        if(cur_content["success"] == False):
            return {"success": False, "message": f"Update failed. Reason: {cur_content['message']}"}
        try:
            self.write_data("part2_data", {
            "id": id,
            "watch_customer_info": json.dumps(data["watch_customer_info"]),
            "watch_customer_history_experience": json.dumps(data["watch_customer_history_experience"]),
            "watch_report_features": json.dumps(data["watch_report_features"]),
            "customer_desire_sentence": data["additional_requests_for_report"]["customer-desire-sentence"],
            "additional_things_to_include_on_report": data["additional_requests_for_report"]["additional_things_to_include_on_report"]
            }, True)
        except Exception as e:
            return {"success": False, "message": f"Update failed due to exception {str(e)}"}
        
        self.update_columns("ywg_tracker_table",
                            id, {"part2": True, "step": 3})
        
        return {"success": True, "message": f"#{id} updated successfully"}

    # must run before report starts generating
    def check_report_generation(self, id):
        if(id == None):
            return {"success": False, "message": "Invalid ID"}
        cur_content = self.verify_id(id)
        if(cur_content["success"] == False):
            return {"success": False, "message": f"Update failed. Reason: {cur_content['message']}"}
        if(cur_content["content"]["report_in_progress"] == True):
            return {"success": False, "message": "Report is already generating."}
        if("report_generated" in cur_content["content"].keys() and cur_content["content"]["report_generated"] == True):
            return {"success": False, "message": "Report has been generated."}
        if(int(cur_content["content"]["report_credits"]) < 1):
            return {"success": False, "message": "Report credits depleted."}
        # report can start generating if this returns true
        return {"success": True, "message": "Report is not generating or has not been generated yet. Ready to generate."}

    # used to force regenerate report, usually when approved by using one report credit
    # note: id assumed to be valid before passing this function
    def reset_report_generation(self, id):
        self.update_columns("ywg_tracker_table", row_id=id, data={"report": False, "report_in_progress": False})
        return {"success": True}

    # update_report_status(id, value=None)
    # updates report_in_progress to stated value (or opposite if value not given)
    def update_report_status(self, id, value=None):
        if(self.check_id(id)):
            if(not value):
                data = self.read_data_by_id("ywg_tracker_table", id)
                if(data["report_in_progress"]):
                    value = False
                else:
                    value = True
            self.update_columns("ywg_tracker_table", id, {"report_in_progress": value})
            return {"success": True, "newValue": value}
        else:
            return {"success": False, "message": "Id doesn't exist"}
    
    # load_report(self, id, reportJSON)
    # loads report from GENAI into database
    
    def load_report(self, id, reportJSON):
        if(self.check_id(id)["success"] != True):
            return {"success": False, "message": "id doesnt exist"}
        
        output = reportJSON["output"]
        current_time = self.read_data_by_id("ywg_tracker_table", id)["report_generated_times"]
        self.update_columns("ywg_tracker_table", id, {
            "report_generated_times": current_time + 1
        })
        for report in output:
            newId = self.generate_random_id("report", "reportid")

            reportStatus = self.write_data("report", {
                "reportid": newId,
                "id": id,
                "report_generated_cycle": current_time,
                "watch_brand": report["watch_brand"],
                "watch_model": report["watch_model"],
                "watch_ref_no": report["watch_ref_no"],
                "basic_info": json.dumps(report["basic_info"]),
                "watch_stats": json.dumps(report["watch_stats"]),
                "watch_fit_criteria": json.dumps(report["watch_fit_criteria"]),
                "watch_fit_gauges": json.dumps(report["watch_fit_gauges"]),
                "pricing": json.dumps(report["pricing"])
            }, True, conflictCol="reportid")
            if(not reportStatus["success"]):
                return {"success": False, "message": f"Error in writing to report. Exception: {reportStatus['message']}"}
            if("images" in report.keys()):
                images = report["images"]
                for image in images:
                    img_status = self.write_data("images", {
                        "reportid": newId,
                        "title": image["title"],
                        "source": image["source"],
                        "url": image["url"]
                    }, False)
                    if(not img_status["success"]):
                        return {"success": False, "message": f"Error in writing to images. Exception: {img_status['message']}"}
            print("DBWriter.py: Report #",newId,"for id",id,"added to db")
            self.update_columns("ywg_tracker_table", id, {"report": True})
        return {"success": True, "message": "Reports added"}

    # get compressed db report dict and make it into regular dict
    # (technically could be used with all other compressed dictionary strings)
    def uncompress_report(self, reportJSON):
        new = {
            
        }
        # the lazy way: Determine if something is json by seeing if the first character is a curly bracket and last is one too
        for key,value in reportJSON.items():
            if(isinstance(value, str)):
                if(value[0] == "{" and value[-1] == "}"):
                    new[key] = json.loads(value)
                else:
                    new[key] = value
            else:
                new[key] = value

        return new

    # lower report credits when used
    def change_report_credits(self, id, amount=-1):
        if(not self.check_id(id)["success"]):
            return {"success": False, "message": "id doesnt exist"}
        cur_data = self.read_data_by_id("ywg_tracker_table", id)
        if(cur_data["report_credits"] + amount < 0):
            return {"success": False, "message": "Not enough report credits"}
        new_credits = cur_data["report_credits"] + amount
        self.update_columns("ywg_tracker_table", id, {"report_credits": new_credits})
        return {"success": True, "new_credits": new_credits}

    # get_images_by_report_id(reportid, image_count=None)
    # if image_count is provided, it will limit results to N images
    def get_images_by_report_id(self, reportid, image_count=None):
        images = self.read_multiple_by_id("images", reportid, "reportid", image_count)
        return images

    # get_reports_by_id(id, reportid=None, report_count=None)
    # if report_count is given (validated as a number), will return max n reports
    # if reportid is given, will only return report with given id
    # if requested_report_time=None, pull up latest automatically
    def get_reports_by_id(self, id, reportid=None, report_count=None, requested_report_time=None): # requested_report_time must be a int
        if(not self.check_id(id)["success"]):
            return {"success": False, "message": "id doesnt exist"}
        else:
            if(report_count != None):
                reports = self.read_multiple_by_id("report", id, limit=report_count)
            elif(reportid != None):
                reports = self.read_data_by_id("report", reportid, col_name="reportid")
            else: # no conditions -> return all reports
                reports = self.read_multiple_by_id("report", id)
        # get images for each report
        if(not reports):
            return {"success": False, "message": "no reports found with said criteria"}
        
        reports_list = []
        cur_report_time = self.read_data_by_id("ywg_tracker_table", id)["report_generated_times"]

        for report in reports:
            # pass each compressed report into uncompress_report to get it back to that nice
            # "nested dictionary" format
            unc_report = self.uncompress_report(report)
            cur_report_id = unc_report["reportid"]
            unc_report["images"] = self.get_images_by_report_id(cur_report_id)
            #print(cur_report_id, unc_report["report_generated_cycle"])
            if(requested_report_time == None):
                condition = (unc_report["report_generated_cycle"] == cur_report_time - 1)
            else:
                condition = (unc_report["report_generated_cycle"] == requested_report_time - 1) # requested_report_time is given to be starting from 1 (1,2,3-)
            if(condition):
                reports_list.append(unc_report)

        
        
        return {"success": True, "reports": reports_list}

    def clear_report_by_reportid(self, reportid):
        try:
            if(self.check_if_exists("report", "reportid", reportid)):
                self.drop_row("report", reportid, column="reportid")
            if(self.check_if_exists("images", "reportid", reportid)):
                self.drop_rows_by_condition("images", f"reportid={reportid}")
            return {"success": True}
        except Exception as e:
            print("DBWriter.py - clear_report_by_reportid failed due to exception ", e)
            return {"success": False, "message": str(e)}
        
     

    def return_all_data_by_id(self, id, returnpart1=True, returnpart2=True, returnreports=False, reportcycle=None): # since returnreports overwrites report status, it is set to false.
        with self.getNewConnection() as conn:
            id = int(id)
            row = self.read_data_by_id("ywg_tracker_table", id)
            if not row:
                return None
            data = dict(row)
            if(data['part1'] and returnpart1):
                part1data = self.read_data_by_id("part1_data", id)
                # move lowerBound and upperBound to priceRange to align with original format
                part1data["priceRange"] = {"lowerBound": part1data["lowerBound"], "upperBound": part1data["upperBound"]}
                del part1data["lowerBound"]
                del part1data["upperBound"]
                data["part1_content"] = part1data
            if(data['part2'] and returnpart2):
                part2data=self.read_data_by_id("part2_data", id)
                part2data["additional_requests_for_report"] = {}
                part2data["additional_requests_for_report"]["customer-desire-sentence"] = part2data["customer_desire_sentence"]
                part2data["additional_requests_for_report"]["additional_things_to_include_on_report"] = part2data["additional_things_to_include_on_report"]
                del part2data["customer_desire_sentence"]
                del part2data["additional_things_to_include_on_report"]
                data["part2_content"] = self.uncompress_report(part2data)
            if(data['report'] and returnreports):
                reports = self.get_reports_by_id(id, requested_report_time=reportcycle) 
                # remember, if reportno = None, latest report will be returned by default
                if(reports["success"]):
                    data['report'] = {
                        "id": id,
                        "output": reports["reports"]
                    }
        
        conn.close()
        return data
            
test= YWGDBWriter('datastore/ywg_main.db')
"""
test.new_watch_id({
        "Version": "1.0",
        "watchBrand": "TestBrand",
        "watchModel": "TestModel",
        "purchaseDecision": "exact_model",
        "additionalInfo": "TAD",
        "specialRequests": "Test",
        "priceRange": {
            "lowerBound": "100",
            "upperBound": "500"
        },
        "pricingStrategy": "strict"}, 7117)
"""
#test.drop_table("part2_data")
"""
print(test.submit_part_2({
    'id': '7117', 
    'watch_customer_info': {
        'for': 'gift', 
        'occasion': 'graduation', 
        'gift': 'dafsdf', 
        'otherOccasion': 'sadfasdf'}, 
    'watch_customer_history_experience': {
        'customer_is_into_watches': 'yesIntoWatches', 
        'customer_owns_a_previous_watch_collection': 'noOwnedWatches', 
        'customer_watch_count': '3', 
        'customer_collection_overview': 'sadfasd'},
    'watch_report_features': 
        {'undefined': '', 
        'isSmartwatch': False, 
        'wr_minimum_100': True, 
        'accurate': False, 
        'how_long_it_lasts': True, 
        'durability': False, 'outfitVersatility': False, 
        'diveCapable': True, 'goodValueRetention': False, 
        'strapCapability': False, 
        'modFriendly': False, 
        'lowMaintenance': True, 
        'authorizedDealerNetwork': False}, 
    'additional_requests_for_report': {
        'customer-desire-sentence': 'dfasdf', 
        'additional_things_to_include_on_report': 'sadfasdf'
        }
    }, 7117))
"""
# print(test.check_report_generation(7117))
# print(test.update_report_status(7117))
"""
print(test.load_report(7117, {
    "id": 7117,
    "output": [
        {
            "watch_brand": "Tissot",
            "watch_model": "PRX 35mm",
            "watch_ref_no": "T137.210.11.111.00",
            "basic_info": {
                "movement": "Swiss Quartz (ETA F05.412)",
                "release_date": "2022",
                "dress_category": [
                    "everyday",
                    "dress"
                ],
                "discontinued": False
            },
            "watch_stats": {
                "wr_rating": 100,
                "material": "stainless steel case, sapphire crystal",
                "diameter": 35.0,
                "lug_to_lug": 39.0,
                "lug_width": 11,
                "fit_wrist_size": "5.5 - 7.0 inches",
                "oem_bracelet_strap": "bracelet, stainless steel"
            },
            "watch_fit_criteria": {
                "watch_fit_ranking": 1,
                "watch_fit_score": 88,
                "watch_fit_report": "The Tissot PRX 35mm with Mother of Pearl dial is precisely what you're looking for. Its 35mm size is excellent for smaller wrists, providing a comfortable and stylish fit. The stunning Mother of Pearl dial directly meets your specific request. While not a dive watch, its 100m water resistance is perfectly suitable for everyday wear, including swimming. This watch offers strong durability, excellent versatility for various outfits, and being a quartz piece, it provides superior longevity and low maintenance.",
                "watch_fit_conclusion": "The Tissot PRX 35mm MOP Quartz is an outstanding choice that perfectly aligns with your specific watch and feature requests, offering exceptional versatility, durability, and practical ownership."
            },
            "watch_fit_gauges": {
                "water_resistance": {
                    "score": 9,
                    "explanation": "With 100 meters of water resistance, this watch is perfectly capable for everyday activities including showering, swimming, and most recreational water sports. It meets your requirement easily."
                },
                "battery": {
                    "score": 9,
                    "explanation": "As a quartz watch, the battery will last for several years (typically 2-3 years or more) before needing replacement, offering superior 'set it and forget it' convenience compared to automatics."
                },
                "durability": {
                    "score": 8,
                    "explanation": "The Tissot PRX is a robust watch, built with a solid stainless steel case and a scratch-resistant sapphire crystal. It's designed to withstand daily wear effectively."
                },
                "versatility": {
                    "score": 10,
                    "explanation": "The PRX design, especially with the elegant Mother of Pearl dial, is incredibly versatile. It transitions seamlessly from casual to dressy occasions, fitting a wide range of outfits."
                },
                "value_retention": {
                    "score": 7,
                    "explanation": "Tissot generally holds decent value on the pre-owned market. While not an investment piece that appreciates, you can expect to recover a fair portion of its cost if you decide to sell in the future."
                }
            },
            "pricing": {
                "customer_price_lower_bound": 600,
                "customer_price_upper_bound": 900,
                "pricing_strategy": "strict",
                "low_average_price": 550,
                "high_average_price": 575,
                "msrp": 575,
                "score": 6,
                "fits_customer_bounds": False,
                "pricing_explanation": "The Tissot PRX 35mm Mother of Pearl Quartz has an MSRP of $575, which falls below your stated lower bound of $600. While this means you're getting the exact watch you want for less than anticipated, your 'strict' pricing strategy implies a desire for the watch to be *within* your $600-$900 range, making this model technically outside those strict parameters. However, for most customers, getting the desired watch under budget is a significant advantage."
            },
            "images": [
                {
                    "title": "Tissot PRX 35mm MOP T1372101111100 for $395 for sale from a ...",
                    "source": "www.chrono24.com",
                    "url": "https://img.chrono24.com/images/uhren/35371489-xckwbgf807884c3rq3mbwdma-ExtraLarge.jpg"
                },
                {
                    "title": "Tissot PRX QUARTZ 35MM MOP DIAL for $375 for sale from a Trusted ...",
                    "source": "www.chrono24.com",
                    "url": "https://img.chrono24.com/images/uhren/34921489-2gpgfs6lagzzwg8q9nru5cys-ExtraLarge.jpg"
                },
                {
                    "title": "Tissot Men's T137.210.11.111.00 PRX 35 mm Quartz for $450 for sale ...",
                    "source": "www.chrono24.com",
                    "url": "https://img.chrono24.com/images/uhren/34417551-e1dcju51z10xmaovrcwce7al-ExtraLarge.jpg"
                },
                {
                    "title": "Tissot Men's T137.210.11.111.00 PRX 35 mm Quartz for $450 for sale ...",
                    "source": "www.chrono24.com",
                    "url": "https://img.chrono24.com/images/uhren/34417551-da5zhpx9zt6n98ko346njy15-ExtraLarge.jpg"
                },
                {
                    "title": "Tissot 35 Mm Prx T137.210.11.111.00 35mm T1372101111100 | Ref ...",
                    "source": "www.chrono24.com",
                    "url": "https://cdn2.chrono24.com/images/product/191187-k9sw15wjjimg36g174wrve9y-Large.jpg"
                }
            ]
        }
    ]
}))"""

#print(test.clear_report_by_reportid(8027))

#print(test.return_all_data_by_id(7117))