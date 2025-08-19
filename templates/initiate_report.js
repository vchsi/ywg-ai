let window_update_tasks = []

function roundToNearest(value, n){
    const result = value % n
    if(result >= (n / 2)){
        return Math.ceil(value / n) * Math.round(n)
    } else {
        return Math.floor(value / n) * Math.round(n)
    }
}

function generateReport(report_data, curId, appendLocation = $("body")){
    const GAUGE_TITLES = {
            "water_resistance": "Water Resistance",
            "battery": "Watch Power Reserve",
            "durability": "Durability",
            "versatility": "Versatility",
            "value_retention": "Value Retention",
            "servicability": "Servicability / Maintenance",
            "ad_strength": "Authorized Support Network"
    }
    const TEN_SCORE_COLORS = {
        0: "red",
        1: "red",
        2: "red",
        3: "orange",
        4: "orange",
        5: "#d1e560ff",
        6: "#d1e560ff",
        7: "#d1e560ff",
        8: "green",
        9: "green",
        10: "green"
    }

    
    const sample_report = $("#sample-report")
    
    report_data.sort(
        function(a,b){
            return a.watch_fit_criteria.watch_fit_ranking - b.watch_fit_criteria.watch_fit_ranking
        }
    )
    for (watch_data of report_data){
        // clone sample report
        let cur_report = sample_report.clone(true)
        cur_report.removeClass("initially-hidden")
        const report_id = `report_${watch_data.watch_fit_criteria.watch_fit_ranking}`
        cur_report.attr("id", report_id)
        const fit_score = watch_data.watch_fit_criteria.watch_fit_score
        cur_report.removeAttr("id")

        // header and heading
        cur_report.find(".report-header > .report-watermark > .cur-id-watermark").text(`${curId} / report cycle ${watch_data.report_generated_cycle + 1}`)
        let heading = cur_report.find(".report-heading")

        heading.find(".ranking-circle > .ranking").text(`#${watch_data.watch_fit_criteria.watch_fit_ranking}`)
        if(watch_data.watch_fit_criteria.watch_fit_ranking === 2){
            heading.find(".ranking-circle").addClass("silver")
        }
        if(watch_data.watch_fit_criteria.watch_fit_ranking > 2){
            heading.find(".ranking-circle").addClass("bronze")
        }

        let basic_info_bar = heading.find(".basic-info-container")
        let watch_status_bar = heading.find(".watch-status-bar")

        // set header (title, releaseyr, movement type, price)
        basic_info_bar.find(".title").text(`${watch_data.watch_brand} ${watch_data.watch_model} (ref no: ${watch_data.watch_ref_no})`)
        watch_status_bar.find(".release-year").text(`📅 ${watch_data.basic_info.release_date}`)
        watch_status_bar.find(".movement").text(`⚙️ ${watch_data.basic_info.movement}`)
        watch_data.basic_info.discontinued ?  watch_status_bar.find(".watch-price").text(`🏷 $${watch_data.pricing.msrp} (discontinued)`) : watch_status_bar.find(".watch-price").text(`🏷 $${watch_data.pricing.msrp}`)

        // set watch fit score
        let watch_fit_gauge = heading.find(".fit-rating-container > .static-score-gauge")

        changeGauge(watch_fit_gauge[0], fit_score)

        // set watch images carousel
        let watch_image_carousel = cur_report.find(".watch-image-carousel")
        if(watch_data.images.length > 0 && watch_data.images !== undefined){
            const num_images = watch_data.images.length
            // console.log("Number of images: ", num_images)
            watch_image_carousel.attr("data-num-images", num_images)
            watch_image_carousel.find(".shown-image").attr("src", watch_data.images[0].url)
            watch_image_carousel.find(".shown-image").attr("data-image-no", 0)
            watch_image_carousel.find(".shown-image").attr("title", `source: (${watch_data.images[0].source})`)
            for (let i = 1; i < num_images; i++){
                let new_image = watch_image_carousel.find("img.hidden-image.sample").clone(true)
                new_image.attr("src", watch_data.images[i].url)
                new_image.attr("title", `source: (${watch_data.images[i].source})`)
                new_image.attr("data-image-no", i)
                new_image.removeClass("sample")
                // console.log(new_image)
                watch_image_carousel.append(new_image)
            }
            watch_image_carousel.find(".sample").remove()
        }

        // watch fit report paragraph

        let report_paragraph = cur_report.find(".report-paragraph")
        let report_watch_styles = cur_report.find("ul.watch-categories")

        report_paragraph.find(".watch-paragraph").text(watch_data.watch_fit_criteria.watch_fit_report)

        // initiate list of watch dress categories
        for (category of watch_data.basic_info.dress_category){
            report_watch_styles.append(`<li style="text-transform: capitalize">${category}</li>`)
        }

        // initialize watch-stats-container (watch_stats subtree in JSON)
        let watch_stats_container = cur_report.find(".watch-stats-container")
        const watch_stats_rows = watch_stats_container.find(".stats-flex-grid-row")

        for (row of watch_stats_rows){
            // go through the row, item by item, picking out appropriate value from data-stat value of .attr-value-pair parent
            for (item of $(row).find(".attr-value-pair")){
                val = watch_data.watch_stats[$(item).data("stat")]
                $(item).find(".value").prepend(val)
            }
        }

        // initialize watch fit gauges
        let watch_fit_gauges_container = cur_report.find(".report-gauges-container > .report-gauges.grid-3c")
        const sample_gauge = watch_fit_gauges_container.find(".circular-gauge.sample")

        // initialize gauges based on watch_fit_gauges section in JSON
        for ([identifier, value] of Object.entries(watch_data.watch_fit_gauges)){
            title = GAUGE_TITLES[identifier]
            new_gauge = sample_gauge.clone(true)
            new_gauge.find(".gauge__descr").text("")
            // <a href='#${report_id}> .report-attribute-analysis > .analysis-content.${identifier}-analysis'>${title}</a> - add this in once I find out how to link to the analysis section
            new_gauge.find(".gauge__descr").append(`${title}`)
            // set gauge with gauge_script.js function
            changeGauge(new_gauge[0], value.score)
            new_gauge.removeClass("sample")
            // add gauge back in
            watch_fit_gauges_container.append(new_gauge)
        }
        // don't forget to add budget!
        new_gauge = sample_gauge.clone(true)
        new_gauge.find(".gauge__descr").text("Budget")
        changeGauge(new_gauge[0], watch_data.pricing.score)
        new_gauge.removeClass("sample")
        watch_fit_gauges_container.append(new_gauge)
        
        // remove sample gauge
        watch_fit_gauges_container.find(".circular-gauge.sample").remove()

        // start with the drop down menus for analysis
        let analysis_container = cur_report.find(".report-attribute-analysis")
        const sample_dropdown = analysis_container.find(".sample")
        // if empty, remove the entire section
        if (Object.keys(watch_data.watch_fit_gauges).length === 0){
            analysis_container.remove()
        } else {
            // otherwise, make a dropdown for every gauge (except budget, of course)
            for ([identifier, value] of Object.entries(watch_data.watch_fit_gauges)){
                content = value
                // console.log(value)
                new_dropdown = sample_dropdown.clone(true)
                new_dropdown.find(".collapsible-box-title > .title-content").text(GAUGE_TITLES[identifier])
                new_dropdown.find(".collapsible-box-title > .attr-score").text(`${content["score"]}/10`)
                new_dropdown.find('.collapsible-box-title > .attr-score').css("color", `${TEN_SCORE_COLORS[Math.ceil(content["score"])]}`)
                new_dropdown.find(".collapsible-box-content > p").text(value["explanation"])
                new_dropdown.removeClass("sample")

                // add dropdown
                analysis_container.append(new_dropdown)
            }
            // remove the sample dropdown
            analysis_container.find(".sample").remove()
        }

        // pricing analysis section
        let pricing_analysis_container = cur_report.find(".report-pricing-analysis")

        let pricing_header = pricing_analysis_container.find(".report-pricing-analysis-header")
        const pricing_data = watch_data.pricing
        pricing_header.find(".price-score").text(`${pricing_data.score}/10`)
        pricing_header.find(".price-score").css("color", TEN_SCORE_COLORS[Math.ceil(pricing_data.score)])


        // the hard part; setting the numerical-meter and determining the lower/upper bounds
        let numerical_meter = cur_report.find(".numerical-meter-container")
        const customer_lower_bound = pricing_data.customer_price_lower_bound
        const customer_upper_bound = pricing_data.customer_price_upper_bound
        const market_lower_bound = pricing_data.low_average_price
        const market_upper_bound = pricing_data.high_average_price
        const msrp = pricing_data.msrp

        // set lower bound of scale based on minimum value
        const min_bound = Math.min(customer_lower_bound, market_lower_bound)
        let scale_lower_bound = -1
        if(min_bound < 50){
            scale_lower_bound = 0
        } else if (min_bound < 250){
            scale_lower_bound = roundToNearest(min_bound / 2, 10)
        } else if (min_bound < 500){
            scale_lower_bound = roundToNearest(min_bound / 1.9, 10)
        } else if (min_bound < 1000){
            scale_lower_bound = roundToNearest(min_bound / 1.7, 25)
        } else if (min_bound < 1500){
            scale_lower_bound = roundToNearest(min_bound / 1.5, 50)
        } else if (min_bound < 3500){
            scale_lower_bound = roundToNearest(min_bound / 1.2, 100)
        } else if (min_bound < 5000){
            scale_lower_bound = roundToNearest(min_bound / 1.1, 100)
        } else {
            scale_lower_bound = roundToNearest(min_bound / 1.05, 500)
        }

        // set upper bound of scale based on max value
        const max_bound = Math.max(customer_upper_bound, market_upper_bound)
        let scale_upper_bound = -1
        if(max_bound < 50){
            scale_upper_bound = Math.round(max_bound * 1.25)
        } else if(max_bound < 250){
            scale_upper_bound = max_bound * 1.35
        } else if(max_bound < 500){
            scale_upper_bound = roundToNearest(max_bound * 1.2, 10)
        } else if(max_bound < 1000){
            scale_upper_bound = roundToNearest(max_bound * 1.25, 25)
        } else if(max_bound < 1500){
            scale_upper_bound = roundToNearest(max_bound * 1.3, 50)
        } else if(max_bound < 2500){
            scale_upper_bound = roundToNearest(max_bound * 1.4, 100)
        } else {
            scale_upper_bound = roundToNearest(max_bound * ((Math.log(max_bound) - 1) / 4), 500)
        }
        numerical_meter.removeAttr("id")
        

        // console.log(scale_lower_bound, scale_upper_bound)
        // change some of the bottom text to give the viewer some more knowledge on what the gauge even means.
        let pricing_info = pricing_analysis_container.find(".pricing-info")

        pricing_info.find(".customer-range-pair > .value").text(`$${customer_lower_bound} - $${customer_upper_bound}`)
        pricing_info.find(".customer-range-pair > .attr > .attr-text").text(`Your Range (${pricing_data.pricing_strategy})`)

        pricing_info.find(".market-range-pair > .value").text(`$${market_lower_bound} - $${market_upper_bound}`)
        pricing_info.find(".market-range-pair > .attr > .attr-text").text(`${watch_data.watch_ref_no} Market Range`)

        pricing_info.find(".msrp-pair > .value").text(`$${pricing_data.msrp}`)
        // set msrp color based on pricing strategy
        const msrp_color = {
            "strict": "#ff0000",
            "moderate": "#E47303",
            "flexible": "green"
        }
        if(pricing_data.pricing_strategy in msrp_color){
            pricing_info.find(".msrp-pair > .attr > .attr-legend").css("color", msrp_color[pricing_data.pricing_strategy])
            pricing_info.find(".msrp-pair > .attr").attr("onmouseout", `clarifyValue(this, false, '${msrp_color[pricing_data.pricing_strategy]}', 3)`) 
        }

        // overlay setup
        const overlay_stats = pricing_info.find(".overflow-pair")

        if(market_lower_bound > customer_upper_bound){
            overlay_stats.find(".attr > .attr-legend").css("color", "red")
            overlay_stats.find(".value").text(`-$${market_lower_bound - customer_upper_bound} (negative)`)
        } else if (customer_lower_bound > market_upper_bound){
            overlay_stats.find(".attr > .attr-legend").css("color", "green")
            overlay_stats.find(".value").text(`+$${customer_lower_bound-market_upper_bound} (positive)`)

        }
        
        // set the dropdown
        pricing_analysis_container.find(".pricing-explanation.collapsible-box-container > .collapsible-box-content > p").text(pricing_data.pricing_explanation)

        // last but not least, set the conclusions
        let conclusion = cur_report.find(".report-conclusion")
        conclusion.find("p.report-conclusion-paragraph").text(watch_data.watch_fit_criteria.watch_fit_conclusion)
        conclusion.find(".final-score").text(`${fit_score}/100`)
        conclusion.find(".final-score").css("color", TEN_SCORE_COLORS[Math.round(fit_score / 10)])

        // at the end, append the report to the container
        appendLocation.append(cur_report)

        // initialize the numerical meter at the end, once the report is fully generated
        initScale(numerical_meter, customer_lower_bound, customer_upper_bound, market_lower_bound, market_upper_bound, msrp, watch_data.pricing.pricing_strategy, scale_lower_bound, scale_upper_bound)
        window_update_tasks.push(() => {
            initScale(numerical_meter, customer_lower_bound, customer_upper_bound, market_lower_bound, market_upper_bound, msrp, watch_data.pricing.pricing_strategy, scale_lower_bound, scale_upper_bound)
        });

    }
    // done generating report. make sure to remove the sample report
    sample_report.remove()
        
}

window.addEventListener("resize", function(){
    for (task of window_update_tasks){
        task()
    }
})