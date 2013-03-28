#!usr/bin/env ruby

require 'sinatra'
require 'data_mapper'
require 'date'

DataMapper::setup(:default, "sqlite3://#{Dir.pwd}/presentator.db")

class Presentation
	include DataMapper::Resource
	property :id, Serial
	property :presenter, String, :required => true
	property :topic, Text, :required => true
	property :link, Text
	property :time_allotted, Integer, :default => 180
	property :presentation_date, Date, :required => true
	property :complete, Boolean, :required => true, :default => false
	property :created_at, DateTime
	property :updated_at, DateTime
end

DataMapper.finalize.auto_upgrade!

helpers do
	include Rack::Utils
	alias_method :h, :escape_html
end


def last_thursday(weeks_ago = 0)
	today = Date.today
	today - (today.cwday + 3) % 7 - weeks_ago * 7
end

get '/' do
	case Date.today.cwday
	when 4
		# thursday
		@presentations = Presentation.all(:presentation_date => Date.today)
		@title = 'Today'
		erb :home
	else
		# redirect to most recent archive
		redirect "/archive/#{last_thursday}"
	end
end

get '/archive/:presentation_date' do |date|
	@presentations = Presentation.all(:presentation_date => date)
	@title = date
	erb :archive
end
