#!usr/bin/env ruby

require 'sinatra'
require 'data_mapper'

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


get '/' do
	@title = 'Today'
	erb :home
end
