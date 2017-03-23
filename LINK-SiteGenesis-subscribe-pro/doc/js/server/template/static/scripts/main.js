$(function () {
    // Search Items
    $('#search').on('keyup', function (e) {
        var value = $(this).val();
        var $el = $('.navigation');

        if (value) {
            var regexp = new RegExp(value, 'i');
            $el.find('li, .itemMembers').hide();
            $el.find('.item').has('.itemMembers').children('.expand').text('+');

            $el.find('li').each(function (i, v) {
                var $item = $(v);

                if ($item.data('name') && regexp.test($item.data('name'))) {
                    $item.show();
                    $item.closest('.itemMembers').show();
                    $item.closest('.item').show();
                    $item.closest('.item').has('.itemMembers').children('.expand').text('-');
                }
            });
        } else {
            $el.find('.item').show();
            $el.find('li, .itemMembers').show();
            $el.find('.itemMembers').hide();
            $el.find('.item').has('.itemMembers').children('.expand').text('+');
        }

        $el.find('.list').scrollTop(0);
    });

    // Toggle when click an item element
    $('.navigation').on('click', '.expand', function (e) {
        $(this).parent().find('.itemMembers').toggle();
        if ($(this).text() === '+') {
           $(this).text('-');
       } else if ($(this).text() === '-') {
           $(this).text('+');
       }
    });
});
