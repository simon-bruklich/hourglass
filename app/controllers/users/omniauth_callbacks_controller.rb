# frozen_string_literal: true

module Users
  # Controller to support logging in via OAuth through Bottlenose
  class OmniauthCallbacksController < Devise::OmniauthCallbacksController
    def bottlenose
      @user = User.from_omniauth(request.env['omniauth.auth'])

      if @user.persisted?
        @user.update_bottlenose_credentials(request.env['omniauth.auth'])
        sign_in_and_redirect @user, event: :authentication
        set_flash_message(:notice, :success, kind: 'Bottlenose') if is_navigational_format?
        bottlenose_api.sync_courses
      else
        session['devise.bottlenose_data'] = request.env['omniauth.auth']
        redirect_to new_user_registration_url
      end
    end

    def failure
      timestamp = Time.current.to_s

      # rubocop: disable Style/StringConcatenation
      mailto_subject = 'Hourglass OAuth Error'
      mailto_body = "~ Autogenerated by Hourglass ~\n"
      mailto_body += "There was an OAuth error when contacting Bottlenose to log in.\n"
      mailto_body += "Timestamp: #{timestamp}\n"
      mailto_body += "Username: #{current_user.username}\n" if current_user
      mailto_link = "mailto:professor?subject=#{ERB::Util.u(mailto_subject)}&body=#{ERB::Util.u(mailto_body)}"
      mailto_button =
        '<div class="d-flex flex-row-reverse"><a target="_blank" href="' +
        mailto_link +
        '" class="btn btn-primary ml-0">Send email</a></div>'
      # rubocop: enable Style/StringConcatenation

      error_msg = 'Unexpected error logging in with Bottlenose.'
      error_msg += '<br>'
      error_msg += 'Use the button below to send a message to a professor or admin with this info.'
      error_msg += '<br>'
      error_msg += "<span class=\"small\">#{timestamp}</span>"
      error_msg += '<br>'
      error_msg += mailto_button

      redirect_to root_path, flash: { error: error_msg }
    end
  end
end
