function fom_init_coll_info() {
  Fom_coll_info = $.extend({}, $.ui.fom_plugin.prototype, {
    _init: function(){
      $.ui.fom_plugin.prototype._init.call(this); // call the original function
      var this_obj = this;
      this.dialog_id = this.options['div_id'] + '_dialog';
      $('#mongo_ui_header_tools_bus').fom_bus('add_listener', this);

      this.options['query'] = {};
      this.options['limit'] = 10;
      this.options['page'] = 0;
      this.options['sort'] = null;
      this.options['clear_data_on_load'] = true; //clear sort/query options when receive data

      $('#mongo_ui_coll_info_tabs').tabs();
      $("#mongo_ui_coll_info_data_btn").button();//.button('.widget').css('width','70px');
      $('#mongo_ui_coll_info_data_expand').button({}).button('.widget').css('width','70px').css('height','25px');
      $('#mongo_ui_coll_info_data_refresh').button({}).button('.widget').css('width','70px').css('height','25px');
      $('#mongo_ui_coll_info_data_next').button().button('.widget').css('width','70px').css('height','25px');
      $('#mongo_ui_coll_info_data_prev').button().button('.widget').css('width','70px').css('height','25px');
      $('#mongo_ui_coll_info_data_next').click(function(){ this_obj.load_next(); });
      $('#mongo_ui_coll_info_data_prev').click(function(){ this_obj.load_prev(); });
      $('#mongo_ui_coll_info_data_refresh').click(function(){
        this_obj.options['clear_data_on_load'] = false;
        this_obj.load_data();
      });
      $('#mongo_ui_coll_info_data_expand').click(function(){
        if ($(this).is(':checked')) {
          $(this).next().html('collapse');
          $('.fom_ui_json_data').children('.fom_ui_json_container').children('.fom_ui_json_value_document').show();
          $('.fom_ui_json_data').children('.fom_ui_json_container').children('.fom_ui_json_toggle').html('-');
        } else {
          $(this).next().html('expand');
          $('.fom_ui_json_data').children('.fom_ui_json_container').children('.fom_ui_json_value_document').hide();
          $('.fom_ui_json_data').children('.fom_ui_json_container').children('.fom_ui_json_toggle').html('+');
        };
      });

      $('#mongo_ui_coll_info_data_page').change(function()  {
        try {
          this_obj.options['page'] = parseInt($('#mongo_ui_coll_info_data_page').val() -1 );
        } catch(e) {
          this_obj.options['page'] = 0;
        };
      });
      $('#mongo_ui_coll_info_data_limit').change(function() {
        try {
          this_obj.options['limit'] = parseInt($('#mongo_ui_coll_info_data_limit').val());
        } catch(e) {
          this_obj.option['limit'] = 10;
        };
      });

      $('#mongo_ui_coll_info_data_sort_options').change( function(){
        $('#mongo_ui_coll_info_data_sort').val($(this).val());
        $('#mongo_ui_coll_info_data_sort').trigger('change');
        if ($(this).attr('selectedIndex') == 1)
          $('#mongo_ui_coll_info_data_sort').show()
        else
          $('#mongo_ui_coll_info_data_sort').hide();
      });
      $('#mongo_ui_coll_info_data_sort').change(function() {
        try {
          this_obj.options['sort'] = $.parseJSON($('#mongo_ui_coll_info_data_sort').val());
        } catch(e) {
          alert('sort syntax error' + e); this_obj.options['sort'] = null;
        };
      });


      $('#mongo_ui_coll_info_tabs').bind("tabsshow", function() {
        if($('#mongo_ui_coll_info_tab_stats').is(':visible'))
          $('#mongo_ajax').fom_object_mongo_ajax('get_collection_stats','','');
        else if($('#mongo_ui_coll_info_tab_indexes').is(':visible'))
          $('#mongo_ajax').fom_object_mongo_ajax('get_collection_indexes','','');
        else if ($('#mongo_ui_coll_info_data').is(':visible'))
          this_obj.load_data();

      });

      $('mongo_ui_coll_info_data_btn').click( function() {
        $('#mongo_ui_coll_info_data').toggle();
      });

      $('#mongo_ui_coll_info_query_builder').fom_query_builder({div_id:'mongo_ui_coll_info_query_builder'});
      if (this.options.disabled) {
        this.disable();
     };

    },

     signal: function(signal_name, signal_source, signal_data ) {
      //alert('colls received signal' + signal_name);
      if (signal_name == 'database_selected')
      {
        $('#mongo_ui_coll_info_dialog').dialog('option', 'title', 'Collection info [no collection selected]');
        this.set_enabled(false);
        $('#' + 'mongo_ui_coll_info_stats').html('');
        $('#' + 'mongo_ui_coll_info_indexes').html('');
      }
      else if (signal_name == 'no_database_selected')
      {
        this.disable();
      }
      else if ( signal_name == 'collection_selected')
      {
        this.set_enabled(true);
        this.options['clear_data_on_load'] = true;
        $('#' + 'mongo_ui_coll_info_stats').html('');
        $('#' + 'mongo_ui_coll_info_indexes').html('');

        var db_name = $('#mongo_ajax').fom_object_mongo_ajax('option','database');
        $('#mongo_ui_coll_info_dialog').dialog(
          'option','title','Collection info [' + db_name + ' -> ' + signal_data['collection'] + ']'
        );
        $('#mongo_ui_coll_info_data_page').val('1');
        this.options['page'] = 0;
        this.options['query'] = {};
        $('#mongo_ui_coll_info_query_builder').fom_query_builder('clear_query');

        if ($('#mongo_ui_coll_info_data').is(':visible')) {
          $('#mongo_ui_coll_info_data_container').html('<img src="/static/fom/img/ajax-loader.gif" style="border: 0;" />');
          this.load_data();
          }
        else if($('#mongo_ui_coll_info_stats').is(':visible')) {
          $('#mongo_ui_coll_info_stats').html('<img src="/static/fom/img/ajax-loader.gif" style="border: 0;" />');
          $('#mongo_ajax').fom_object_mongo_ajax('get_collection_stats','','');
        }
        else if($('#mongo_ui_coll_info_indexes').is(':visible')) {
          $('#mongo_ui_coll_info_indexes').html('<img src="/static/fom/img/ajax-loader.gif" style="border: 0;" />');
          $('#mongo_ajax').fom_object_mongo_ajax('get_collection_indexes','','');
        }
      }
      else if ( signal_name == 'collection_stats_received')
      {
        data = signal_data['data'];

        $('#' + 'mongo_ui_coll_info_stats').html('');
        $('#' + 'mongo_ui_coll_info_stats')
          .append(
            $('<div/>')
              .append('<div>Summary:</div>')
              .append('<span class="mongo_ui_coll_info_stats_name">Document count:</span><span class="mongo_ui_coll_info_stats_value">' + $.format.number(data['count'], ',###') + '</span><br/>')
              .append('<span class="mongo_ui_coll_info_stats_name">Total size:</span><span class="mongo_ui_coll_info_stats_value">' + $('#fom_utils').fom_utils('format_filesize', data['storageSize']) + '</span><br/>')
              .append('<span class="mongo_ui_coll_info_stats_name">Number of indexes:</span><span class="mongo_ui_coll_info_stats_value">' + data['nindexes'] + '</span><br/>')
              .append(              //format size of each index
                (function(){
                var idx = $(null);
                for(k in data['indexSizes']) {
                  idx=idx.add(
                    $('<span class="mongo_ui_coll_info_stats_name" />')
                      .css('margin-left','10px')
                      .html('index ' + k + ' :')
                    .add($('<span class="mongo_ui_coll_info_stats_value"></span>')
                      .html($('#fom_utils').fom_utils('format_filesize', data['indexSizes'][k]))
                      .add('<br/>')
                    )
                   )
                 };

                return idx;
                })()
              )
          ).append(
            $('#fom_utils').fom_utils('fom_expandable',{state:'closed'}).click(function(){
              $(this).next().next().toggle();
              $(this).html( $(this).next().next().is(':visible')? '-':'+');
            })
          )
          .append('<span>Show details</span>')
          .append(
            //$('<div>' +JSON.stringify(signal_data['data'], null, '  ') + '</div>').hide()
             $('<div/>').html($('#fom_utils').fom_utils('render_json_value',signal_data['data'])).hide()

          );




        /*
        html = '<div>';
        html += '<span class="mongo_ui_coll_info_stats_name">Document count:</span><span class="mongo_ui_coll_info_stats_value">' + data['count'] + '</span><br/>';
        html += '<span class="mongo_ui_coll_info_stats_name">Total size:</span><span class="mongo_ui_coll_info_stats_value">' + $('#fom_utils').fom_utils('format_filesize', data['storageSize']) + '</span><br/>';
        html += '<span class="mongo_ui_coll_info_stats_name">Number of indexes:</span><span class="mongo_ui_coll_info_stats_value">' + data['nindexes'] + '</span><br/>';
        html += '</div>';
        html += '<div>' + JSON.stringify(signal_data['data'], null, '\n') + '</div>'
        //$('#' + 'mongo_ui_coll_info_stats').html(

        $('#fom_utils').fom_utils( 'expandable', $(html))


        //);
        */

      }
      else if ( signal_name == 'collection_indexes_received')
      {
        $('#' + 'mongo_ui_coll_info_indexes').html(JSON.stringify(signal_data['data'], null, '  '));

      }

    },
    load_data: function()
    {
      //if (!query) query = {};
      //if(!limit) limit = 10;
      $('#mongo_ui_coll_info_data_container').html('<img src="/static/fom/img/ajax-loader.gif" style="border: 0;" />');

      $('#mongo_ajax').fom_object_mongo_ajax('get_data',
        //this.options['query'],
        $('#mongo_ui_coll_info_query_builder').fom_query_builder('build_query'),
        {
          limit: this.options['limit'],
          skip: this.options['page'] * this.options['limit'],
          sort: this.options['sort'],
          callback: this.data_loaded,
          context: this,
      });
    },
    load_next: function()
    {
      $('#mongo_ui_coll_info_data_page').val( parseInt($('#mongo_ui_coll_info_data_page').val()) + 1 );
      this.options['page'] = parseInt($('#mongo_ui_coll_info_data_page').val()) -1 ;
      this.options['clear_data_on_load'] = false;
      $('#mongo_ui_coll_info_data_container').html('<img src="/static/fom/img/ajax-loader.gif" style="border: 0;" />');
      this.load_data();
    },
    load_prev: function()
    {
      if(this.options['page'] > 0 )
      {
        $('#mongo_ui_coll_info_data_page').val( parseInt($('#mongo_ui_coll_info_data_page').val()) - 1 );
        this.options['page'] = parseInt($('#mongo_ui_coll_info_data_page').val()) -1 ;
        this.options['clear_data_on_load'] = false;
        $('#mongo_ui_coll_info_data_container').html('<img src="/static/fom/img/ajax-loader.gif" style="border: 0;" />');
        this.load_data();
      }
    },

    clear_sort_options: function() {
      if ($('#mongo_ui_coll_info_data_sort_options')[0].options.length > 2) {
        for( var i = $('#mongo_ui_coll_info_data_sort_options')[0].options.length -1; i > 3; i--)
        {
          $($('#mongo_ui_coll_info_data_sort_options')[0].options[i]).remove();
        };
      };

    },

    data_loaded: function(data)
    {
      if ( 'error' in data ) { alert('error: ' + data['error']); return; }

      //format and display received data
      if (data['data'].length == 0) {
          $('#mongo_ui_coll_info_data_container').html('There are no records matching query');
      } else {
        $('#mongo_ui_coll_info_data_container').html($('#fom_utils').fom_utils('format_mongo_json_data', data['data']));
        $('#fom_utils').fom_utils('add_json_events', $('.fom_ui_json_data').get()[0], {'expand': $('#mongo_ui_coll_info_data_expand').is(':checked')});
      };

      $('#mongo_ui_coll_info_data_page_count').html(data['meta']['count']);

      if (this.options['clear_data_on_load'] == true) {
        this.clear_sort_options();
        var orig_key_list = $('#fom_utils').fom_utils('fom_json_list_keys', data['data'] );
        var key_list = [];

        $.each(orig_key_list, function(k,v) {
          key_list.push(v);
          if (v != '_id') {
            $('#mongo_ui_coll_info_data_sort_options').append("<option value='[[" + '"'+ $('#fom_utils').fom_utils('escape_html', v) + '", 1]'+']' +"'"+'>' + $('#fom_utils').fom_utils('escape_html', v) + ' ASC</option>');
            $('#mongo_ui_coll_info_data_sort_options').append("<option value='[[" + '"'+ $('#fom_utils').fom_utils('escape_html', v) + '",-1]'+']' +"'"+'>' + $('#fom_utils').fom_utils('escape_html', v) + ' DESC</option>');
          };
        });
        key_list.sort();
        $('#mongo_ui_coll_info_query_builder').fom_query_builder('completion_source', key_list);

      };

    },
    enable: function() {
      this.set_enabled(true);
    },
    disable: function() {
      this.set_enabled(false);
    },
    /*
      Helper: single function for enabling/disabling
    */
    set_enabled: function(enabled) {
      if (enabled) {
        method = 'enable';
        $.ui.fom_plugin.prototype.enable.call(this); // call the original function
        $('#mongo_ui_coll_info_tabs').tabs().show();
      } else {
        method = 'disable';
        $.ui.fom_plugin.prototype.disable.call(this); // call the original function
        $('#mongo_ui_coll_info_tabs').tabs().hide();
      }
      $('#' + this.dialog_id ).dialog(method);

    },


  });
  $.widget("ui.fom_plugin_coll_info", Fom_coll_info);


  //init collection list
  $('#mongo_ui_header_tools').after('<span id="mongo_ui_header_tools_coll_info"></span>');
  $(window).load( function() {$('#mongo_ui_header_tools_coll_info').fom_plugin_coll_info({div_id:'mongo_ui_coll_info', disabled: true}); });

  //end of collection info
}
