function fom_init_about() {
  Fom_plugin_about = $.extend({}, $.ui.fom_plugin.prototype, {
    _init: function(){
      $.ui.fom_plugin.prototype._init.call(this); // call the original function

      var this_obj = this;
      this.dialog_id = this.options['div_id'] + '_dialog';


      //dialog - about info
      $('#' + this.options['div_id'] + '_dialog').dialog({
        autoOpen: false,
        height: 350,
        width: 350,
        modal: true,
        closeOnEscape: true,
        buttons: {
          'Close': function() {$(this).dialog('close');},
        },
        title: 'Fang of Mongo - about',
        //position : [220,100],
        close: function() {
          //$('#mongo_ui_about_menu_btn').attr('checked',false);
          $('#mongo_ui_about_menu_btn').button('refresh');
        },


      }); //end of dialog


      //menu button
      $('#mongo_ui_menu').append('<button id="mongo_ui_about_menu_btn">About</button>');
      $('#mongo_ui_about_menu_btn').button();
      var dialog_id = '#' + this.dialog_id;
      $('#mongo_ui_about_menu_btn').click(
        function () {
          $(dialog_id).dialog('isOpen')? $(dialog_id).dialog('close') : $(dialog_id).dialog('open');
        }
      );

    },


  });
  $.widget("ui.fom_plugin_about", Fom_plugin_about);


  //init
  $('#mongo_ui_header_tools').after('<span id="mongo_ui_header_tools_about"></span>');
  $('#mongo_ui_header_tools_about').fom_plugin_about({div_id:'mongo_ui_about'});
}
