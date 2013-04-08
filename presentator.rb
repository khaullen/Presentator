#!usr/bin/env ruby

require 'sinatra'
require 'data_mapper'
require 'date'
require './settings.rb'

# Build database connection string from settings and setup the connection
db = SETTINGS[:database]
db_string = db[:type] + "://" + db[:user] + ":" + db[:password] + "@" + db[:server] + "/" + db[:name]
DataMapper::setup(:default, ENV['DATABASE_URL'] || db_string)

class Day
  include DataMapper::Resource
  
	property :presentation_date, Date, :key => true
	property :last_updated, Time
	
	has n, :presentations
	
	def self.today
	  self.get(Date.today)
	end
end

class Presentation
	include DataMapper::Resource
	
	property :id, Serial
	property :presenter, String, :required => true
	property :topic, Text, :required => true
	property :link, Text
	property :time_allotted, Integer, :default => 120
	property :complete, Boolean, :required => true, :default => false
	property :created_at, Time
	property :updated_at, Time
	property :in_progress, Boolean, :required => true, :default => false
	property :started_at, Time
	property :ended_at, Time
	
	belongs_to :day
	
	def self.upcoming
	  all(:complete => false, :day => { :presentation_date => Date.today })
	end
	
	def self.completed
	  all(:complete=>true, :day => { :presentation_date => Date.today })
	end
	
	def finish_at
		@started_at && (@started_at + @time_allotted).strftime('%s')
	end
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
	when SETTINGS[:presentation][:day]
		# thursday
		@upcoming = Presentation.upcoming
		@completed = Presentation.completed
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
	p = Presentation.create(
	  :topic      =>  params[:topic],
	  :presenter  =>  params[:presenter],
	  :link       =>  params[:link],
	  :created_at =>  Time.now,
	  :updated_at =>  Time.now,
	  :day        =>  Day.first_or_create(
	    { :presentation_date  =>  Date.today },
	    { :last_updated       =>  Time.now }
	  )
	)
	redirect '/'
end

get '/archive/:presentation_date' do |date|
	@presentations = Presentation.all(:day => { :presentation_date => date })
	@title = date
	erb :archive
end

get '/admin' do
  @upcoming = Presentation.upcoming
  @completed = Presentation.completed
	@title = 'Admin'
	erb :presentations
end

post '/start-presentation/:id' do |id|
	p = Presentation.get(id)
	p.update(
	  :started_at   =>  Time.now,
	  :updated_at   =>  Time.now,
	  :in_progress  =>  true
	)
	p.day.update( :last_updated => Time.now )
	p.finish_at
end

post '/stop-presentation/:id' do |id|
	p = Presentation.get(id)
  p.update(
	  :ended_at     =>  Time.now,
	  :updated_at   =>  Time.now,
	  :in_progress  =>  false,
	  :complete     =>  true
	)
	p.day.update( :last_updated => Time.now )
end

get '/update/:name' do |name|
	if (Time.now - Day.today.last_updated > 20)
		204	
	else
    @upcoming = Presentation.upcoming
    @completed = Presentation.completed
		@title = name
		erb :presentations, :layout => false
	end
end
