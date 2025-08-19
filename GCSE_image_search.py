import os
import httpx

class GCSEClient:
    def __init__(self):
        self.GCSE_API_KEY = os.environ.get("GCSE_API_KEY")
        self.CUSTOM_SEARCH_ID = os.environ.get("GCSE_SEARCH_KEY")
        self.BASE_URL = "https://customsearch.googleapis.com/customsearch/v1"
        self.lastResult = []


    def watchImageSearch(self, query):
        
        params = {
            'key': self.GCSE_API_KEY,
            'cx': self.CUSTOM_SEARCH_ID,
            'excludeTerms': 'accessory',
            'imgType': 'photo',
            'num': 5,
            'q': query,
            'safe': "active",
            'searchType': "image"
        }

        response = httpx.get(self.BASE_URL, params=params)
        response.raise_for_status()
        result = response.json()
        resultDict = []
        print("GCSE_image_search.py: Search Done!. number of results: ", len(result["items"]) if "items" in result else 0)
        if "items" not in result.keys():
            return []
        for item in result["items"]:
            resultDict.append((item["link"], item["snippet"], item["displayLink"]))
        
        self.lastResult = resultDict
        return resultDict
    
    def lastImages(self):
        return self.lastResults


