#!/usr/bin/env ruby

require 'sinatra'
require 'data_mapper'
require 'date'
require 'uri'
require './settings.rb'

# Build database connection string from settings and setup the connection
def database_url
  if ENV['DATABASE_URL']
    ENV['DATABASE_URL']
  else
    db = SETTINGS[:database]
    db[:type] + "://" + db[:user] + ":" + db[:password] + "@" + db[:server] + "/" + db[:name]
  end
end

DataMapper::setup(:default, database_url)

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
  property :position, Float
  property :presenter, String, :required => true
  property :topic, Text, :required => true
  property :time_allotted, Integer, :default => 120
  property :complete, Boolean, :required => true, :default => false
  property :created_at, Time
  property :updated_at, Time
  property :in_progress, Boolean, :required => true, :default => false
  property :started_at, Time
  property :ended_at, Time
  
  belongs_to :day
  has n, :links
  
  def self.upcoming
    all(:complete => false, :day => { :presentation_date => Date.today }, :order => [ :position.asc ])
  end
  
  def self.completed
    all(:complete=>true, :day => { :presentation_date => Date.today }, :order => [ :position.asc ])
  end
  
  def finish_at
    @started_at && (@started_at + @time_allotted).strftime('%s')
  end
end

class Link
  include DataMapper::Resource
  
  property :id, Serial
  property :uri, URI, :required => true
  
  belongs_to :presentation
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

def create_links(string)
  URI.extract(string, ["http", "https"]).map do |link|
    Link.create(:uri => URI(link))
  end
end

get '/' do
  case Date.today.cwday
  when SETTINGS[:presentation][:day]
    # thursday
    @upcoming = Presentation.upcoming
    @completed = Presentation.completed
    @title = 'Today'
    erb :form do
      erb :presentations do
        erb :completed
      end
    end
  else
    # redirect to most recent archive
    redirect "/archive/#{last_thursday}"
  end
end

post '/' do
  p = Presentation.create(
    :topic          =>  params[:topic],
    :presenter      =>  params[:presenter],
    :time_allotted  =>  (params[:time_allotted].to_i * 60),
    :created_at     =>  Time.now,
    :updated_at     =>  Time.now,
    :day            =>  Day.first_or_create(:presentation_date => Date.today),
    :links          =>  create_links(params[:link])
  )
  p.update(:position => p.id)
  p.day.update(:last_updated => Time.now)
  redirect '/'
end

get '/edit/:id' do |id|
  @title = 'Edit'
  @presentation = Presentation.get(id)
  erb :edit
end

put '/edit/:id' do |id|
  p = Presentation.get(id)
  p.links.destroy
  p.update(
    :topic      =>  params[:topic],
    :presenter  =>  params[:presenter],
    #:complete   =>  params[:complete] ? 1 : 0,
    :updated_at =>  Time.now,
    :links      =>  create_links(params[:link])
  )
  p.day.update(:last_updated => Time.now)
  redirect '/'
end

delete '/delete/:id' do |id|
  p = Presentation.get(id)
  p.destroy
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
  erb :admin do
    erb :completed
  end
end

post '/start-presentation' do
  p = Presentation.upcoming.first
  p.update(
    :started_at   =>  Time.now,
    :updated_at   =>  Time.now,
    :in_progress  =>  true
  )
  p.day.update( :last_updated => Time.now )
  p.finish_at
end

post '/stop-presentation' do
  p = Presentation.upcoming.first
  p.update(
    :ended_at     =>  Time.now,
    :updated_at   =>  Time.now,
    :in_progress  =>  false,
    :complete     =>  true
  )
  p.day.update( :last_updated => Time.now )
end

def move_to_top(presentation)
  # If a presentation is in progress, we want to move the presentation to just below the one in progress
  if (Presentation.upcoming.first.in_progress)
    lower = Presentation.upcoming.first.position
    higher = Presentation.upcoming[1].position
  else
    lower = (Presentation.completed.last && Presentation.completed.last.position) || 0
    higher = Presentation.upcoming.first.position
  end
  presentation.update( :position => (higher + lower) / 2 )
end

put '/up/:id' do |id|
  p = Presentation.get(id)
  move_to_top(p)
  p.day.update( :last_updated => Time.now )
  redirect '/admin'
end

def get_template(template_name) 
  if (Day.today && (Time.now - Day.today.last_updated < 20))
    @upcoming = Presentation.upcoming
    @completed = Presentation.completed
    erb template_name, :layout => false do
      erb :completed
    end
  else
    204  
  end
end

get '/admin/update' do
  get_template(:admin)
end

get '/update' do
  get_template(:presentations)
end
