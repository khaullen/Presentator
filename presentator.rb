#!usr/bin/env ruby

require 'sinatra'
require 'data_mapper'
require 'date'

DataMapper::setup(:default, ENV['DATABASE_URL'] || "postgres://khaullen:regan@localhost/presentator")

class Presentation
	include DataMapper::Resource
	property :id, Serial
	property :presenter, String, :required => true
	property :topic, Text, :required => true
	property :link, Text
	property :time_allotted, Integer, :default => 120
	property :presentation_date, Date, :required => true
	property :complete, Boolean, :required => true, :default => false
	property :created_at, Time
	property :updated_at, Time
	property :in_progress, Boolean, :required => true, :default => false
	property :started_at, Time
end

DataMapper.finalize.auto_upgrade!

class Presentation
	def finish_at
		#@started_at && @started_at + @time_alloted
		(Time.now + @time_allotted).strftime('%s')
	end
end

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
	when 3
		# thursday
		@presentations = Presentation.all(:presentation_date => Date.today)
		@title = 'Today'
		erb :home do
			erb :presentations
		end
	else
		# redirect to most recent archive
		redirect "/archive/#{last_thursday}"
	end
end

post '/' do
	p = Presentation.new
	p.topic = params[:topic]
	p.presenter = params[:presenter]
	p.link = params[:link]
	p.created_at = p.updated_at = Time.now
	p.presentation_date = Date.today
	p.save
	redirect '/'
end

get '/archive/:presentation_date' do |date|
	@presentations = Presentation.all(:presentation_date => date)
	@title = date
	erb :archive
end

get '/admin' do
	@presentations = Presentation.all(:presentation_date => Date.today)
	@title = 'Admin'
	erb :presentations
end


