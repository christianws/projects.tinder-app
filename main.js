 /*
 Render the customer orders into the page as an HTML table
Order the results by customer name
Order the results by order value
Order the results by date
Optional extra task - Turn the data into a chart
*/
  
  // note: this JSON data has been edited so that the dates have a longer range
  var customer_orders = [ 
      { order_number:  1, customer: 'Jess Learmonth',    total_cost: 200,    processed_date: '23/01/2016' },
      { order_number:  2, customer: 'Jody Stimpson',     total_cost: 100,    processed_date: '24/02/2016' },
      { order_number:  3, customer: 'Helen Jenkins',     total_cost: 300,    processed_date: '14/06/2016' },
      { order_number:  4, customer: 'Vicky Holland',     total_cost: 300,    processed_date: '12/04/2016' },
      { order_number:  5, customer: 'Lucy Hall',         total_cost: 100,    processed_date: '13/04/2016' },
      { order_number:  6, customer: 'Non Stanford',      total_cost: 500,    processed_date: '12/01/2016' },
      { order_number:  7, customer: 'Alistair Brownlee', total_cost: 400,    processed_date: '01/10/2016' },
      { order_number:  8, customer: 'Johnny Brownlee',   total_cost: 100.99, processed_date: '03/04/2016' },
      { order_number:  9, customer: 'Adam Bowden',       total_cost: 500,    processed_date: '04/01/2016' },
      { order_number: 10, customer: 'Gordon Benson',     total_cost: 300,    processed_date: '29/08/2016' },
      { order_number: 11, customer: 'Tom Bishop',        total_cost: 400,    processed_date: '12/07/2016' },
      { order_number: 12, customer: 'Non Stanford',      total_cost: 300,    processed_date: '31/09/2015' },
      { order_number: 13, customer: 'Johnny Brownlee',   total_cost: 200.50, processed_date: '15/05/2016' },
      { order_number: 14, customer: 'Adam Bowden',       total_cost: 100,    processed_date: '22/01/2016' }
    ];


     function orderResults(arr,orderBy){
       arr.sort(function(a, b){     
        var keyA, keyB;       
          if(orderBy=="processed_date"){
             keyA =  formatDate(a[orderBy]) ;
             keyB =  formatDate(b[orderBy]) ;
          }else{
            keyA = a[orderBy];
            keyB = b[orderBy];
          }      
            //compare
            if(keyA < keyB) return -1;
            if(keyA > keyB) return 1;
            return 0;
      });
      return arr;
    }

    function formatDate(date){
        date = date.trim().split('/');
        date = date[1] + '-' + date[0] + '-' + date[2];
        return new Date ( date );
    }

    function createTableContent(arr){
        var content='';
        for(var i=0; i<customer_orders.length; i++){
          content +=  '<tr>' + 
                      '<td>' + customer_orders[i]['order_number'] + '</td>'+
                      '<td>' + customer_orders[i]['customer'] + '</td>'+
                      '<td>' + customer_orders[i]['total_cost'] + '</td>'+
                      '<td>' + customer_orders[i]['processed_date'] + '</td>'+
                      '</tr>';
        }
        return content;
    }
    
    function fillTable(arr,sortBy,reset){
        var ordered = orderResults(customer_orders, sortBy);
        var content = createTableContent(ordered)
        //add/replace content into body of table
        $('#customers-tbl tbody').html(content);
    }

    /*** Creating Total Cost Data for Graph ***/

    //used for extracting ht emonth and year from a JS date
    function monthAndYear(date){
      var split = date.split('/');
      var monthYear = (split[1] + '/' + split[2]).trim();
      return monthYear;
    }
  
    // find the amount of months between two dates
    function monthDiff(arr){ // accepts an ordered arr
      var date1 = arr[0]["processed_date"];
      console.log("date1: " + Number(date1.split('/')[1]) );
      var date2 = arr[arr.length-1]["processed_date"];
      //calculate difference
      var yearsDiff = date2.split('/')[2] - date1.split('/')[2];
      var monthsDiff = date2.split('/')[1] - date1.split('/')[1];
    
      var totalMonthlyDiff = (yearsDiff * 12) + monthsDiff; 
      return totalMonthlyDiff
    }

    // caluclate the monthly totals from an arr of objects
    function createMonthlyTotals(arr){
        
      var orderedDates = orderResults(arr, "processed_date");
      var date1 = orderedDates[0]["processed_date"];
      var totalMonthlyDiff = monthDiff(orderedDates);

      var startDate= date1.split('/')[1] + '/' + date1.split('/')[2];

      // create an array of all months
      var initYear = Number(startDate.split('/')[1]);
      var initMonth = Number(startDate.split('/')[0] ) -1;
      var currMonth, currYear;
      var monthTotal = [];

      //create the object for every month in the range of the dataset
      for(var j=0; j<=totalMonthlyDiff; j++){  
         currMonth = ((initMonth+j)  % 12  );
         if(!currYear) currYear=initYear;
         if(currMonth===0) currYear ++;
         monthTotal.push({
                        "month" : ("0" + String(currMonth+1)).slice(-2) + '/' + currYear, 
                        "total" : 0,
                        "customers" : []

                      });
      } 

     // fill the objects with "total" and individual customer purchases
     for(var k=0; k<monthTotal.length; k++){
     
        var monthTotalMonth = monthTotal[k]["month"]; 
       
        for(var l=0; l<orderedDates.length; l++){ // for all the data
          // if date matches add value to price
          var orderedDatesMonth =  monthAndYear(orderedDates[l]["processed_date"]);
         
           if(orderedDatesMonth === monthTotalMonth){
              // add value of order to total cost
              monthTotal[k]["total"] += orderedDates[l]["total_cost"];
              // add individual customer purchases for use with the tooltip
              monthTotal[k]["customers"].push({
                        "customer": orderedDates[l]['customer'],
                        "order_cost":orderedDates[l]["total_cost"]
                      })
              orderedDates.splice(l,1); // delete entry so it won't be searched again (optimisation)
              l--; //decrease inc if found to counteract effect of splice removing an element
           }
       

        }
          
     }
     /* the final array of objects 
           month, total, customers
                            customer
                            order_cost
    */

    return monthTotal;

    }// createMonthlyTotals()

   //store the Totals object
   var monthTotals = createMonthlyTotals(JSON.parse(JSON.stringify(customer_orders)));
   
    $( document ).ready(function() {

        fillTable(customer_orders,"order_number");

         $( "#order-number_head" ).click(function() {
           fillTable(customer_orders,"order_number");
         })
         $( "#customer_head" ).click(function() {
           fillTable(customer_orders,"customer");
         })
         $( "#total-cost_head" ).click(function() {
           fillTable(customer_orders,"total_cost");
         })
         $( "#processed-date_head" ).click(function() {
           fillTable(customer_orders,"processed_date");
         })
    
      createBarChart(monthTotals);

      function createBarChart(data){
        var vData =[];
        var hData =[];
        var monthNames = ["Jan","Feb","Mar","Apr","May","June","Jul","Aug","Sep","Oct","Nov","Dec"];
       // extract data from monthTotals obj for use with the graph
        for(var i=0; i<data.length; i++){
          vData.push(data[i]["total"]);
          hData.push(data[i]["month"]);
        }
       
        var myData = vData;

        var margin ={
          top: 30,
          right: 30,
          bottom: 40,
          left:50 
        };

        var height =  400 - margin.top - margin.bottom; // max of mydata
        var width=  800 -margin.right - margin.left;

        var tooltip = d3.select('body').append('div')
          .attr("class","tooltip")
          .style('position', 'absolute')
          .style('background', '#f4f4f4')
          .style('padding','5 15px')
          .style('border', '1px #333 solid')
          .style('border-raidus', '5px')
          .style('opacity','0')
        // create function for printing Customers to tooltip
        function printCustomers(customers){
          var result = "";
          for(var i =0; i<customers.length; i++){
            //console.log(JSON.stringify(customers[i].customer,null,1) );
            result += customers[i].customer + ":" + customers[i].order_cost +"<br>"
          }
          return result;
        }
        var yScale = d3.scaleLinear()
          .domain([0,d3.max(myData)])  // this is the range of the values 0- max of data
          .range([0,height]) // the height of the original svg
        
        var xScale = d3.scaleBand() // ordinal means you can have specified intervals
          .domain(d3.range(0,myData.length)) // the range of different values from myData
          .range([0,width]) // defines the valuerange of vhere the values will be plotted against

        var colors = d3.scaleLinear()
          .domain([0,myData.length])
          .range(['#90ee90','#30c230'])

          //create canvas
        var canvas = d3.select("#chart")
          .append('svg')
          .attr('width',width + margin.right + margin.left)
          .attr('height',height + margin.top + margin.bottom)
          .append('g')
          .attr('transform', 'translate('+margin.left+',' +margin.top+')')
          .style('background','#f4f4f4')
          
          // create bars
        canvas.selectAll('rect')
            .data(myData)
            .enter().append('rect') //enter is used for creating multiple elements
              .style('fill',function(d,i){
                return colors(i);
              })
              .attr('width', xScale.bandwidth())
              .attr('height',function(d){
                return yScale(d);
              })
              .attr('x', function(d,i){
                return xScale(i)
              })
              .attr('y', function(d){
                return height-yScale(d);
              })
              .on('mouseover', function(d,i){
                tooltip.transition()
                  .style('opacity',1)
                tooltip.html( // add html to tooltip
                  "<b>Total: " + d +"</b></br>" +
                  printCustomers(monthTotals[i]["customers"])
                  )
                  .style('left', (d3.event.pageX) +'px')
                  .style('top', (d3.event.pageY) + 'px')
                d3.select(this).style('opacity',0.5) // make the current bar semi transparent
              })
              .on('mouseout', function(d){
                tooltip.transition()
                  .style('opacity',0)
                d3.select(this).style('opacity',1)
              })

          /* creating axis */
          var vScale = d3.scaleLinear()
          .domain([0,d3.max(myData)]) 
          .range([height,0]) // height first so the 0 is at the bottom (vector top to bottom)
        
          var hScale = d3.scaleBand() // ordinal means you can have specified intervals
          .domain(d3.range(0,myData.length)) // the range of different values from myData
         .range([0,width]) // defines the valuerange of vhere the values will be plotted against
          // V Axis
          var vAxis = d3.axisLeft(vScale)
            .ticks(5)
            .tickPadding([5])
            // V guide
            var vGuide = d3.select("svg")
              .append('g')
                vAxis(vGuide)
                vGuide.attr('transform','translate('+margin.left+','+margin.top+')')
                vGuide.selectAll('path')
                  .style('fill','none')
                  .style('stroke','#000')
                vGuide.selectAll('line')
          // X Axis
          var hAxis = d3.axisBottom(hScale)
           .tickValues(d3.range(0,myData.length))
           .tickFormat(function(d, i){
                return (monthNames[ Number(hData[d].split('/')[0]) -1] + hData[d].split('/')[1].slice(-2)); // format for month + last 2 digits of year e.g. Mar 06
            })

           // .tickSize(10,0)
            .tickPadding([5]) // just for creating a space from the axis
            // V guide

            var hGuide = d3.select("svg")
              .append('g')
                hAxis(hGuide)
                hGuide.attr('transform','translate('+margin.left+','+(height + margin.top) +')')
                hGuide.selectAll('path')
                  .style('fill','none')
                  .style('stroke','#000')
                hGuide.selectAll('line')

        
          canvas.append("text")
          .attr("class", "x label")
          .attr("text-anchor", "end")
          //.attr("transform", "rotate(-45)")
          .attr("x", width/2 + margin.left)
          .attr("y", height + ((margin.bottom/9) * 8))
          .text("months");
          canvas.append("text")
          .attr("class", "y label")
          .attr("text-anchor", "middle")
          .attr("y", height/2 )
          .attr("transform", "translate("+ (-(height/2)-(margin.left/6*5)) +","+height/2+") rotate(-90)")
          .text("total cost");
          
        
      }
        
    }); //end document.ready()
    