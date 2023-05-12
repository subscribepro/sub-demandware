'use strict';

var formValidation = require('base/components/formValidation');
var cleave = require('base/components/cleave');
var url;

/**
 * Remove all validation. Should be called every time before revalidating form
 * @param {element} form - Form to be cleared
 * @returns {void}
 */
function clearFormErrors(form) {
    $(form).find('.form-control.is-invalid').removeClass('is-invalid');
}

/**
 * Coll server to save a new credit card
 * @returns {void}
 */
var savePayment = function () {
    var $form = $('body').find('form.payment-form');
    url = $form.attr('action');
    var formData = cleave.serializeData($form);
    $.ajax({
        url: url,
        type: 'post',
        dataType: 'json',
        data: formData,
        success: function (data) {
            $form.spinner().stop();
            if (!data.success) {
                formValidation($form, data);
            } else {
                location.href = data.redirectUrl;
            }
        },
        error: function (err) {
            if (err.responseJSON.redirectUrl) {
                window.location.href = err.responseJSON.redirectUrl;
            }
            $form.spinner().stop();
        }
    });
};

module.exports = {
    removePayment: function () {
        $('.remove-payment').on('click', function (e) {
            e.preventDefault();
            url = $(this).data('url') + '?UUID=' + $(this).data('id');
            $('.payment-to-remove').empty().append($(this).data('card'));

            $('.delete-confirmation-btn').click(function (f) {
                f.preventDefault();
                $('.remove-payment').trigger('payment:remove', f);
                $.ajax({
                    url: url,
                    type: 'get',
                    dataType: 'json',
                    success: function (data) {
                        $('#uuid-' + data.UUID).remove();
                        if (data.message) {
                            var toInsert = '<div class="row justify-content-center h3 no-saved-payments"><p>' + data.message + '</p></div>';
                            $('.paymentInstruments').empty().append(toInsert);
                        }
                    },
                    error: function (err) {
                        if (err.responseJSON.redirectUrl) {
                            window.location.href = err.responseJSON.redirectUrl;
                        }
                        $.spinner().stop();
                    }
                });
            });
        });
    },

    submitPayment: function () {
        $('form.payment-form').submit(function (e) {
            var $form = $(this);
            e.preventDefault();
            url = $form.attr('action');
            var urlToCheck = $form.attr('action-to-check');

            $form.spinner().start();
            $('form.payment-form').trigger('payment:submit', e);

            $.ajax({
                url: urlToCheck,
                type: 'GET',
                success: function (data) {
                    if (!data.success) {
                        $('body').append(data);
                        $('#addAddressModal').modal('show');
                    } else {
                        savePayment();
                    }
                    $.spinner().stop();
                },
                error: function () {
                    $.spinner().stop();
                }
            });

            return false;
        });
    },

    handleCreditCardNumber: function () {
        if ($('#cardNumber').length && $('#cardType').length) {
            cleave.handleCreditCardNumber('#cardNumber', '#cardType');
        }
    },

    submitAddress: function () {
        $('body').on('submit', 'form.address-form', function (e) {
            e.preventDefault();
            var $form = $(this);
            url = $form.attr('action');
            $form.spinner().start();
            $.ajax({
                url: url,
                type: 'post',
                dataType: 'json',
                data: $form.serialize(),
                success: function (data) {
                    $form.spinner().stop();
                    if (!data.success) {
                        formValidation($form, data);
                    } else {
                        clearFormErrors($form);
                        savePayment();
                    }
                },
                error: function (err) {
                    if (err.responseJSON.redirectUrl) {
                        window.location.href = err.responseJSON.redirectUrl;
                    }
                    $form.spinner().stop();
                }
            });
            return false;
        });
    }
};
