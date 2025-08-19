# ⌚ YWG.ai #
### Your watch expert, now in AI ###

YWG.ai (Your Watch Guy) uses AI to find the best selection of watches for you to buy or gift. Through learning your preferences through a few quick, easy surveys, YWG's servers can compile a easy-to-read report contaning all the data you need to purchase.

---
## Our techstack ##:

YWG.ai uses Google Gemini 2.5flash (through google-genai) and Google Images Search (through google-cse) to create the reports. Front end is handled through traditional JavaScript and JQuery, while the back end uses Flask. 

SQLite is currently being used to store data, but I hope to change it to MYSQL for better performance and scalability.

---
## Features ##

- Two straightforward surveys determined to gauge user's preferences, interests, budget, and more info.
- Report recommendation gauged by 10+ different customer preferences, as well as customer's qualitative responses.
- A easy-to-read, interactive report which simplifies obscure metrics while providing a glance at the product.
- Everything compiled into a fit score (**out of 100**), and justification.
- Ability to regenerate reports for better results.

### Coming soon... ###

- MYSQL database connector, for streamlined and concurrent reading compared to SQLite.
- Ability to chat with 'YWG.live', our personalized AI Agent, to get more information on your watch.
- Ability to regenerate better reports from customer feedback, better prompting.
- Affiliate linking with Watch ADs (Authorized Dealers).

---

## Sample report ##

<img src="https://ywgai.pythonanywhere.com/resources/sample_report_1.png" width="50%" height="50%">

<a href="https://ywgai.pythonanywhere.com">Have a look! (Work in progress, expect lots of bugs)</a> 

