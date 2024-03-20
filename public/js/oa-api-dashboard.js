$(function() {

  $(".datasets-table").tablesorter({
    theme : "bootstrap",
    sortList: [[0,0]],
    headers: { 5: {sorter: false}, 7: {sorter: false}},
    widthFixed: true,

    // widget code contained in the jquery.tablesorter.widgets.js file
    // use the zebra stripe widget if you plan on hiding any rows (filter widget)
    // the uitheme widget is NOT REQUIRED!
    widgets : [ "filter", "columns", "zebra" , "group" ],

    widgetOptions : {
      // using the default zebra striping class name, so it actually isn't included in the theme variable above
      // this is ONLY needed for bootstrap theming if you are using the filter widget, because rows are hidden
      zebra : ["even", "odd"],

      // class names added to columns when sorted
      columns: [ "primary", "secondary", "tertiary" ],

      // reset filters button
      filter_reset : ".reset",

      // extra css class name (string or array) added to the filter element (input or select)
      filter_cssFilter: [
        'form-control',
        'form-control',
        'form-control custom-select', // select needs custom class names :(
        'form-control',
        'form-control',
        'form-control',
        'form-control'
      ],

      filter_childRows: true,
    },
  });

  /* Publisher details */
  $("a[data-cs-publisher-id]").click(function(e){
    e.preventDefault();

    let csPublisherId = $(this).data("cs-publisher-id");

    if (!csPublisherId){
      return;
    }

    let tr = $("tr[data-cs-publisher-id="+csPublisherId+"]");
    let td = tr.children("td").first();

    /* If we don't have the details already in the dom fetch them */
    if (td.html().length == 0){
      td.text("Loading…");
      $.get("/details_snippet/publisher/" + csPublisherId, function(data){
        td.html(data);
      })
    }

    tr.toggle();
  });

});
