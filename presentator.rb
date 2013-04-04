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
	property :ended_at, Time
end

DataMapper.finalize.auto_upgrade!

class Presentation
	def finish_at
		@started_at && (@started_at + @time_allotted).strftime('%s')
	end
end

configure do
	@@last_updated = Time.now
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
	when 4
		# thursday
		presentations = Presentation.all(:presentation_date => Date.today)
		@upcoming = presentations.select { |p| !p.complete }
		@completed = presentations.select { |p| p.complete }
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
	@@last_updated = Time.now
	redirect '/'
end

get '/archive/:presentation_date' do |date|
	@presentations = Presentation.all(:presentation_date => date)
	@title = date
	erb :archive
end

get '/admin' do
	presentations = Presentation.all(:presentation_date => Date.today)
	@upcoming = presentations.select { |p| !p.complete }
	@completed = presentations.select { |p| p.complete }
	@title = 'Admin'
	erb :presentations
end

post '/start-presentation/:id' do |id|
	p = Presentation.all(:id => id)[0]
	p.started_at = p.updated_at = Time.now
	p.in_progress = true
	p.save
	@@last_updated = Time.now
	p.finish_at
end

post '/stop-presentation/:id' do |id|
	p = Presentation.all(:id => id)[0]
	p.ended_at = p.updated_at = Time.now
	p.in_progress = false
	p.complete = true
	p.save
	@@last_updated = Time.now
end

get '/update/:name' do |name|
	if (Time.now - @@last_updated > 20)
		0		
	else
		presentations = Presentation.all(:presentation_date => Date.today)
		@upcoming = presentations.select { |p| !p.complete }
		@completed = presentations.select { |p| p.complete }
		@title = name
		erb :presentations, :layout => false
	end
end


