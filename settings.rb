SETTINGS = {
    :database => {
        :type => "postgres",
        :user => ENV["DB_USER"],
        :password => ENV["DB_PASSWORD"],
        :server => "localhost",
        :name => "presentator"
    },
    :presentation => {
        :day => 4
    }
}
