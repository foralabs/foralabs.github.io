FROM ruby:3.3-slim

# build-essential is needed to compile native gem extensions (e.g. ffi/sass).
RUN apt-get update -qq \
  && apt-get install -y --no-install-recommends build-essential \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /srv/jekyll

# Install gems in a layer that only busts when the Gemfile changes.
COPY Gemfile ./
RUN bundle install

EXPOSE 4000 35729

CMD ["bundle", "exec", "jekyll", "serve", \
     "--host", "0.0.0.0", "--force_polling", "--livereload"]
